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

import sg.edu.nus.iss.backend.model.Event;
import sg.edu.nus.iss.backend.model.Task;

@Repository
public class PlannerRepository {

    @Autowired
    private MongoTemplate template;

    // get all events belonging to a workspace of user
    public List<Event> getAllEvents(String id) {

        System.out.println(id);
        MatchOperation matchOps = Aggregation
                .match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("events");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("events.id").as("id")
                .and("events.title").as("title")
                .and("events.start").as("start")
                .and("events.end").as("end")
                .and("events.allDay").as("allDay");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "planner", Document.class);

        List<Document> docs = results.getMappedResults();

        // no events
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<Event> events = new LinkedList<>();
        docs.forEach(d -> {
            System.out.println(d.toJson());
            Event e = new Event();
            e = e.docToEvent(d);
            events.add(e);
        });

        return events;
    }

    public boolean addEventsToWorkspace(String id, List<Event> events) {

        Query query = new Query(Criteria.where("id").is(id));

        List<Document> result = template.find(query, Document.class, "planner");

        List<Document> docList = new ArrayList<>();
        for (Event event : events) {
            docList.add(event.toDocument(event));
        }

        // if planner object does not exist - insert
        if (result.isEmpty()) {

            Document doc = new Document();
            doc.put("id", id);
            doc.put("events", docList);
            Document insert = template.insert(doc, "planner");
            return !(insert.isEmpty());
        }

        // else - override
        Update updateOps = new Update().set("events", docList);

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "planner");

        return updateResult.getModifiedCount() > 0;
    }

    public List<Task> getAllOutstandingTasks(String id, String[] workspaces) {
        List<Task> tasks = new LinkedList<>();

        for (String workspace : workspaces) {

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
                break;
            }

            docs.forEach(d -> {
                System.out.println(d.toJson());
                Task t = new Task();
                t = t.convertDocToTask(d);
                // only add incompleted task
                if (!t.isCompleted()){
                    tasks.add(t);
                }
            });
        }

        return tasks;
    }
}
