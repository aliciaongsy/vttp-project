package sg.edu.nus.iss.backend.repository;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.backend.model.Task;

@Repository
public class TaskRepository {

    @Autowired
    private MongoTemplate template;

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

        List<String> w = getWorkspacesById(id);

        // if there is no workspace data for this particular id
        if (w.size() == 0) {
            List<String> workspaces = new ArrayList<>();
            workspaces.add(workspace);

            Document doc = new Document();
            doc.put("id", id);
            doc.put("workspaces", workspaces);

            Document insert = template.insert(doc, "workspaces");
            return !(insert.isEmpty());
        }

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        Update updateOps = new Update().push("workspaces").value(workspace);

        UpdateResult update = template.updateFirst(query, updateOps, Document.class, "workspaces");

        return update.getModifiedCount() > 0;

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

        System.out.println(id);
        System.out.println(workspace);
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
    public Document getIncompleteTaskDueSoon(){
        long currentTime = new Date().getTime();

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

        Aggregation pipeline = Aggregation.newAggregation(unwindOps, matchOps, sortOps, projectOps);

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
    public List<Document> getOverdueTask(){
        long currentTime = new Date().getTime();

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

        Aggregation pipeline = Aggregation.newAggregation(unwindOps, matchOps, sortOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        return docs;
    }

    /*db.tasks.aggregate([
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
    public List<Document> getOutstandingTasks(){
        long currentTime = new Date().getTime();

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

        Aggregation pipeline = Aggregation.newAggregation(unwindOps, matchOps, sortOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);

        List<Document> docs = results.getMappedResults();

        return docs;
    }


}
