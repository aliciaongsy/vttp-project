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

    /*
     * db.tasks.aggregate([
     * {
     * $match: {
     * $and: [
     * {id: "d73726d8"},
     * {workspace: "workspace1"}
     * ]
     * }
     * },
     * {
     * $unwind: "$tasks"
     * },
     * {
     * $project: {
     * _id: 0,
     * task:"$tasks.task",
     * priority:"$tasks.priority",
     * start:"$tasks.start",
     * due:"$tasks.due",
     * completed:"$tasks.completed"
     * }
     * }
     * ]);
     */
    public List<Task> getAllTasks(String id, String workspace) {

        System.out.println(id);
        System.out.println(workspace);
        MatchOperation matchOps = Aggregation
                .match(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        AggregationOperation unwindOps = Aggregation.unwind("tasks");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("tasks.task").as("task")
                .and("tasks.priority").as("priority")
                .and("tasks.start").as("start")
                .and("tasks.due").as("due")
                .and("tasks.completed").as("completed");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "tasks", Document.class);
        System.out.println(results.toString());

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

}
