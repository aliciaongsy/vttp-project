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

@Repository
public class PlannerRepository {

    @Autowired
    private MongoTemplate template;

    // get all events belonging to a workspace of user
    public List<Event> getAllEvents(String id, String workspace) {

        System.out.println(id);
        System.out.println(workspace);
        MatchOperation matchOps = Aggregation
                .match(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

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

    public boolean addEventsToWorkspace(String id, String workspace, List<Event> events) {

        List<Event> e = getAllEvents(id, workspace);

        List<Document> docList = new ArrayList<>();
        for (Event event: events){
            docList.add(event.toDocument(event));
        }

        // if task object does not exist - insert
        if (e.isEmpty()) {

            Document doc = new Document();
            doc.put("id", id);
            doc.put("workspace", workspace);
            doc.put("events", docList);
            Document insert = template.insert(doc, "planner");
            return !(insert.isEmpty());
        }

        // else - override
        Query query = new Query(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        Update updateOps = new Update().set("events", docList);

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "planner");

        return updateResult.getModifiedCount() > 0;
    }

}
