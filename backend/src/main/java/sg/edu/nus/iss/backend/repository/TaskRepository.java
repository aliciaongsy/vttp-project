package sg.edu.nus.iss.backend.repository;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.TimeZone;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.backend.exception.DeleteWorkspaceException;
import sg.edu.nus.iss.backend.exception.UpdateCountException;
import sg.edu.nus.iss.backend.model.Task;

@Repository
public class TaskRepository {

    @Autowired
    private MongoTemplate template;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // find workspace by user id
    public List<String> getWorkspacesById(String id) {
        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "workspaces");

        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<String> workspaces = docs.getFirst().getList("workspaces", String.class);

        return workspaces;
    }

    public boolean addWorkspace(String id, String workspace) {

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "workspaces");

        // if there is no workspace data for this particular id
        if (docs.isEmpty()) {
            List<String> workspaces = new ArrayList<>();
            workspaces.add(workspace);

            Document doc = new Document();
            doc.put("id", id);
            doc.put("workspaces", workspaces);

            Document insert = template.insert(doc, "workspaces");
            return !(insert.isEmpty());
        }

        Update updateOps = new Update().push("workspaces").value(workspace);

        UpdateResult update = template.updateFirst(query, updateOps, Document.class, "workspaces");

        return update.getModifiedCount() > 0;

    }

    public void deleteWorkspace(String id, String workspace) throws DeleteWorkspaceException{
        System.out.println(id);
        System.out.println(workspace);
        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        Update updateOps = new Update().pull("workspaces", workspace);

        UpdateResult update = template.updateFirst(query, updateOps, Document.class, "workspaces");

        if(update.getModifiedCount() == 0){
            throw new DeleteWorkspaceException("error deleting workspace");
        }
    }

    /*db.tasks.aggregate([
    {
        $match: { "id": "ebfba879", "workspace" : "project"}
        
    },
    {
        $unwind: "$tasks"
    },
    {
        $group: {
            _id: "$tasks.completed",
            "count": {$sum: 1}
        }
    }
    ]) */
    public void deleteWorkspaceTasks(String id, String workspace) throws DeleteWorkspaceException, UpdateCountException{

        // get count for incompelete and completed tasks
        Criteria criteria = Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace));

        MatchOperation matchOps = Aggregation.match(criteria);

        AggregationOperation unwindOps = Aggregation.unwind("$tasks");

        GroupOperation groupOps = Aggregation.group("$tasks.completed").count().as("count");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, groupOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);


        /*{
            "_id" : true,
            "count" : 1.0
        }
        {
            "_id" : false,
            "count" : 1.0
        }
        */
        List<Document> docs = results.getMappedResults();

        // decrease count in sql db
        for (Document doc: docs){
            System.out.println("decrease count in sql");
            boolean bool = doc.getBoolean("_id");
            int count = doc.getInteger("count");
            updateCountAfterDeleteWorkspace(id, bool, count);
        }
        

        // delete all tasks
        Query query = new Query(criteria);

        DeleteResult delete = template.remove(query, Document.class, "tasks");

        if(delete.getDeletedCount() == 0){
            throw new DeleteWorkspaceException("error deleting tasks belonging to workspace");
        }
    }

    /* db.tasks.aggregate([
    {
        $match: {
            $and: [
                {id: "d73726d8"},
                {workspace: "workspace1"}
            ]
        }
    },
    {
        $unwind: "$tasks"
    },
    {
        $project: {
            _id: 0,
            id: "$tasks.id",
            task:"$tasks.task",
            status:"$tasks.status",
            priority:"$tasks.priority",
            start:"$tasks.start",
            due:"$tasks.due",
            completed:"$tasks.completed"
        }
    }
    ]); */
    public List<Task> getAllTasks(String id, String workspace) {

        MatchOperation matchOps = Aggregation
                .match(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        AggregationOperation unwindOps = Aggregation.unwind("tasks");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("tasks.id").as("id")
                .and("tasks.task").as("task")
                .and("tasks.status").as("status")
                .and("tasks.priority").as("priority")
                .and("tasks.start").as("start")
                .and("tasks.due").as("due")
                .and("tasks.completed").as("completed");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        // no tasks
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<Task> tasks = new LinkedList<>();
        docs.forEach(d -> {
            System.out.println(d.toJson());
            Task t = new Task();
            t = t.convertDocToTask(d);
            tasks.add(t);
        });

        return tasks;
    }

    public boolean addTaskToWorkspace(String id, String workspace, Task task) {

        Query query = new Query(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        List<Document> result = template.find(query, Document.class, "tasks");

        // if task object does not exist - insert
        if (result.isEmpty()) {
            List<Document> t = new ArrayList<>();
            t.add(task.toDocument(task));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("workspace", workspace);
            doc.put("tasks", t);
            Document insert = template.insert(doc, "tasks");
            return !(insert.isEmpty());
        }

        // else - update
        Update updateOps = new Update().push("tasks").value(task.toDocument(task));

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "tasks");

        return updateResult.getModifiedCount() > 0;

    }
        

    /* db.tasks.updateOne(
        {
            "id": "d73726d8",
            "workspace":"workspace1",
            "tasks": {"$elemMatch": {"id": "618d9d7b"}}
        },
        {
            "$set": {"tasks.$.completed": false}
            "$set": {"tasks.$.status": }
        }
    ); */
    public boolean updateCompleteStatus(String id, String workspace, String taskId, boolean completed){
        Criteria criteria = Criteria.where("id").is(id)
            .andOperator(Criteria.where("workspace").is(workspace), Criteria.where("tasks").elemMatch(Criteria.where("id").is(taskId)));
        
        Query query = new Query(criteria);

        Update updateOps = new Update()
            .set("tasks.$.completed", completed)
            .set("tasks.$.status", completed ? "Completed" : "In Progress");

        UpdateResult update = template.updateFirst(query, updateOps, "tasks");

        return update.getModifiedCount() > 0;
    }

    /* db.tasks.updateOne(
        {
            id: "d73726d8",
            workspace: "workspace1",
            tasks: {"$elemMatch": {"id": "1ca6eae1"}}
        },
        {
            $pull:{
                tasks:{
                    id: "1ca6eae1"
                }
            }
        }
    ); */
    public boolean deleteTaskById(String id, String workspace, String taskId){
        Criteria criteria = Criteria.where("id").is(id)
            .andOperator(Criteria.where("workspace").is(workspace), Criteria.where("tasks").elemMatch(Criteria.where("id").is(taskId)));

        System.out.println("delete id:" + taskId);

        Query query = new Query(criteria);

        Update updateOps = new Update()
            .pull("tasks", new Query(Criteria.where("id").is(taskId)));
        
        UpdateResult update = template.updateFirst(query, updateOps, "tasks");

        return update.getModifiedCount() > 0;
    }

    /* db.tasks.updateMany(
        {
            id: "d73726d8",
            workspace: "workspace1",
            "tasks": {"$elemMatch": {"id": "b3e8af34"}}
        },
        {
            $set: {
                "tasks.$":{
                    "id": "b3e8af34",
                    "task": "task1",
                    "status": "In Progress",
                    "priority": "Low",
                    "start": NumberLong(1710580014720),
                    "due": NumberLong(1711728000000),
                    "completed": false
                }
            }
        }
    );*/
    public boolean updateTaskById(String id, String workspace, String taskId, Task task){
        Criteria criteria = Criteria.where("id").is(id)
            .andOperator(Criteria.where("workspace").is(workspace), Criteria.where("tasks").elemMatch(Criteria.where("id").is(taskId)));
        
        Query query = new Query(criteria);

        Update updateOps = new Update()
            .set("tasks.$.id", task.getId())
            .set("tasks.$.task", task.getTask())
            .set("tasks.$.status", task.getStatus())
            .set("tasks.$.priority", task.getPriority())
            .set("tasks.$.start", task.getStart())
            .set("tasks.$.due", task.getDue())            
            .set("tasks.$.completed", task.isCompleted());
        
        UpdateResult update = template.updateFirst(query, updateOps, "tasks");

        return update.getModifiedCount() > 0;
    }

        /* db.tasks.updateOne(
        {
            "id": "d73726d8",
            "workspace":"workspace1",
            "tasks": {"$elemMatch": {"id": "618d9d7b"}}
        },
        {
            "$set": {"tasks.$.completed": false}
            "$set": {"tasks.$.status": }
        }
    ); */
    public boolean updateTaskByAttribute(String id, String workspace, String taskId, String variable, String value){
        Criteria criteria = Criteria.where("id").is(id)
            .andOperator(Criteria.where("workspace").is(workspace), Criteria.where("tasks").elemMatch(Criteria.where("id").is(taskId)));
        
        Query query = new Query(criteria);

        Update updateOps = new Update();
        // updating status
        if (variable.equals("status")){
            updateOps.set("tasks.$.status", value);
            // if value of status change is "Completed", update complete variable
            if (value.equals("Completed")){
                updateOps.set("tasks.$.completed", true);
            }
        }
        else if (variable.equals("start") || variable.equals("due")){
            // convert string "dd/MM/yyyy" to long
            SimpleDateFormat format = new SimpleDateFormat("dd/MM/yyyy");
            try {
                Date date = format.parse(value);
                long milliseconds = date.getTime();
                updateOps.set("tasks.$.%s".formatted(variable), milliseconds);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        else{
            updateOps.set("tasks.$.%s".formatted(variable), value);
        }
        
        UpdateResult update = template.updateFirst(query, updateOps, "tasks");

        return update.getModifiedCount() > 0;
    }

    /*db.tasks.aggregate([
        {
            $match: {id: "d73726d8"}
        },
        {
            $unwind: "$tasks"
        },
        {
            $match: {
                "tasks.due": { $gte: 1711641600000 },
                "tasks.completed": false
            }
        },
        {
            $sort: 
                {
                    "tasks.due": 1
                }
        },
        {
            $project: {
                _id: 0,
                workspace: 1,
                id: "$tasks.id",
                task: "$tasks.task",
                status: "$tasks.status",
                priority: "$tasks.priority",
                start: "$tasks.start",
                due: "$tasks.due",
                completed: "$tasks.completed"
            }
        }
    ]); */
    public Document getIncompleteTaskDueSoon(String id){
        long currentTime = new Date().getTime();

        MatchOperation match = Aggregation.match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("tasks");

        MatchOperation matchOps = Aggregation.match(Criteria.where("tasks.due").gte(currentTime).andOperator(Criteria.where("tasks.completed").is(false)));

        SortOperation sortOps = Aggregation.sort(Sort.by(Direction.ASC, "tasks.due"));

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("workspace").as("workspace")
                .and("tasks.id").as("id")
                .and("tasks.task").as("task")
                .and("tasks.status").as("status")
                .and("tasks.priority").as("priority")
                .and("tasks.start").as("start")
                .and("tasks.due").as("due")
                .and("tasks.completed").as("completed");

        Aggregation pipeline = Aggregation.newAggregation(match, unwindOps, matchOps, sortOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        Document doc = new Document();
        if (docs.isEmpty()) {
            return doc;
        }

        doc = docs.getFirst();
        return doc;
    }

    /*db.tasks.aggregate([
        {
            $match: {id: "d73726d8"}
        },
        {
            $unwind: "$tasks"
        },
        {
            $match: {
                "tasks.due": { $lt: 1711641600000 },
                "tasks.completed": false
            }
        },
        {
            $sort: 
                {
                    "tasks.due": 1
                }
        },
        {
            $project: {
                _id: 0,
                workspace: 1,
                id: "$tasks.id",
                task: "$tasks.task",
                status: "$tasks.status",
                priority: "$tasks.priority",
                start: "$tasks.start",
                due: "$tasks.due",
                completed: "$tasks.completed"
            }
        }
    ]); */
    public List<Document> getOverdueTask(String id){
        long currentTime = new Date().getTime();

        MatchOperation match = Aggregation.match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("tasks");

        MatchOperation matchOps = Aggregation.match(Criteria.where("tasks.due").lt(currentTime).andOperator(Criteria.where("tasks.completed").is(false)));

        SortOperation sortOps = Aggregation.sort(Sort.by(Direction.ASC, "tasks.due"));

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("workspace").as("workspace")
                .and("tasks.id").as("id")
                .and("tasks.task").as("task")
                .and("tasks.status").as("status")
                .and("tasks.priority").as("priority")
                .and("tasks.start").as("start")
                .and("tasks.due").as("due")
                .and("tasks.completed").as("completed");

        Aggregation pipeline = Aggregation.newAggregation(match, unwindOps, matchOps, sortOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        return docs;
    }

    /*db.tasks.aggregate([
        {
            $match: {id: "d73726d8"}
        },
        {
            $unwind: "$tasks"
        },
        {
            $match: {
                "tasks.due": { $gte: 1711641600000 },
                "tasks.completed": false
            }
        },
        {
            $sort: 
                {
                    "workspace": 1,
                    "tasks.due": 1,
                }
        },
        {
            $project: {
                _id: 0,
                workspace: 1,
                id: "$tasks.id",
                task: "$tasks.task",
                status: "$tasks.status",
                priority: "$tasks.priority",
                start: "$tasks.start",
                due: "$tasks.due",
                completed: "$tasks.completed"
            }
        }
    ]); */
    public List<Document> getOutstandingTasks(String id){

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Singapore"));
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        long currentTime = cal.getTime().getTime();

        MatchOperation match = Aggregation.match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("tasks");

        MatchOperation matchOps = Aggregation.match(Criteria.where("tasks.due").gte(currentTime).andOperator(Criteria.where("tasks.completed").is(false)));

        SortOperation sortOps = Aggregation.sort(Sort.by(Direction.ASC, "workspace"))
	        .and(Sort.by(Direction.ASC, "tasks.due"));

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("workspace").as("workspace")
                .and("tasks.id").as("id")
                .and("tasks.task").as("task")
                .and("tasks.status").as("status")
                .and("tasks.priority").as("priority")
                .and("tasks.start").as("start")
                .and("tasks.due").as("due")
                .and("tasks.completed").as("completed");

        Aggregation pipeline = Aggregation.newAggregation(match, unwindOps, matchOps, sortOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        return docs;
    }

    // --- SQL ---
    // get total number of task completed and incompleted
    public JsonObject getTaskDataSummary(String id){
        SqlRowSet rs = jdbcTemplate.queryForRowSet(Queries.SQL_GET_TASK_DATA_BY_ID, id);

        JsonObjectBuilder builder = Json.createObjectBuilder();
        if(rs.first()){
            builder.add("complete", rs.getInt("complete"))
                .add("incomplete", rs.getInt("incomplete"))
                .add("total", rs.getInt("total"));
            return builder.build();
        }
        return builder.build();
    }

    public void updateTaskCount(String id, boolean completed, String action) throws UpdateCountException{
        switch(action){
            case "add": 
                {
                    boolean empty = getTaskDataSummary(id).isEmpty();
                    int update = 0;
                    int upd = 0;
                    if (empty){
                        update = jdbcTemplate.update(Queries.SQL_INSERT_COUNT, id, completed ? 1 : 0, completed ? 0: 1);
                    }
                    else{
                        update = jdbcTemplate.update(Queries.SQL_INCREMENT_TASK_COUNT, id);
                        if (completed){
                            upd = jdbcTemplate.update(Queries.SQL_INCREMENT_COMPLETE_COUNT, id);
                        }
                        else{
                            upd = jdbcTemplate.update(Queries.SQL_INCREMENT_INCOMPLETE_COUNT, id);
                        }
                        if (upd == 0){
                        throw new UpdateCountException("error updating count");
                        }
                    }
                    if (update==0){
                        throw new UpdateCountException("error updating count");
                    }
                }
                break;
            
            case "delete":
                {
                    int update = jdbcTemplate.update(Queries.SQL_DECREASE_TASK_COUNT, id);
                    int upd = 0;
                    if (completed){
                        upd = jdbcTemplate.update(Queries.SQL_DECREASE_COMPLETE_COUNT, id);
                    }
                    else{
                        upd = jdbcTemplate.update(Queries.SQL_DECREASE_INCOMPLETE_COUNT, id);
                    }

                    if ( update==0 || upd == 0){
                        throw new UpdateCountException("error updating count");
                    }
                }
                break;

            case "update": 
                {
                    int update = 0;
                    int upd = 0;
                    if (completed){
                        upd = jdbcTemplate.update(Queries.SQL_INCREMENT_COMPLETE_COUNT, id);
                        update = jdbcTemplate.update(Queries.SQL_DECREASE_INCOMPLETE_COUNT, id);
                    }
                    else{
                        upd = jdbcTemplate.update(Queries.SQL_INCREMENT_INCOMPLETE_COUNT, id);
                        update = jdbcTemplate.update(Queries.SQL_DECREASE_COMPLETE_COUNT, id);
                    }

                    if ( update==0 || upd == 0){
                        throw new UpdateCountException("error updating count");
                    }

                }
                break;

            default:
                break;
        }
    }

    public void updateCountAfterDeleteWorkspace(String id, boolean completed, int deleteCount) throws UpdateCountException{

        int update = jdbcTemplate.update(Queries.SQL_DECREASE_TASK_COUNT_BY_VALUE, deleteCount, id);
        int upd = 0;
        if (completed){
            upd = jdbcTemplate.update(Queries.SQL_DECREASE_COMPLETE_COUNT_BY_VALUE, deleteCount, id);
        }
        else{
            upd = jdbcTemplate.update(Queries.SQL_DECREASE_INCOMPLETE_COUNT_BY_VALUE, deleteCount, id);
        }

        if ( update==0 || upd == 0){
            throw new UpdateCountException("error updating count");
        }

                
    }

}
