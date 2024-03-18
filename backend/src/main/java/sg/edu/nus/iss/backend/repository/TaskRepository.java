package sg.edu.nus.iss.backend.repository;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
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

        List<Task> tasks = getAllTasks(id, workspace);

        // if task object does not exist - insert
        if (tasks.isEmpty()) {
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
        Query query = new Query(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

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

}
