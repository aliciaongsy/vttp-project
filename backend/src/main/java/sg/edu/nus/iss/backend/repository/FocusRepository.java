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

import sg.edu.nus.iss.backend.model.Session;

@Repository
public class FocusRepository {

    @Autowired
    private MongoTemplate template;

    /* db.focus.aggregate([
    {
        $match: {
            $and: [
                {id: "d73726d8"},
                {workspace: "workspace1"}
            ]
        }
    },
    {
        $unwind: "$sessions"
    },
    {
        $project: {
            _id: 0,
            date:"$sessions.date",
            duration:"$sessions.duration",
        }
    }
    ]); */
    public List<Session> getAllSessions(String id, String workspace){
        MatchOperation matchOps = Aggregation
                .match(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        AggregationOperation unwindOps = Aggregation.unwind("sessions");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("sessions.date").as("date")
                .and("sessions.duration").as("duration");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "focus", Document.class);

        List<Document> docs = results.getMappedResults();

        if(docs.isEmpty()){
            return new LinkedList<>();
        }

        List<Session> sessions = new LinkedList<>();
        docs.forEach(d -> {
            System.out.println(d.toJson());
            Session sess = new Session();
            sess.setDate(d.getString("date"));
            sess.setDuration(d.getInteger("duration"));
            sessions.add(sess);
        });

        return sessions;
    }

    public boolean addSessionToWorkspace(String id, String workspace, String date, int duration) {

        Query query = new Query(Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace)));

        List<Document> result = template.find(query, Document.class, "focus");

        // if mongo object does not exist - insert
        if (result.isEmpty()) {

            List<Document> docList = new ArrayList<>();
            Document d = new Document();
            d.put("date", date);
            d.put("duration", duration);
            docList.add(d);

            Document doc = new Document();
            doc.put("id", id);
            doc.put("workspace", workspace);
            doc.put("sessions", docList);
            Document insert = template.insert(doc, "focus");
            return !(insert.isEmpty());
        }

        // else - check if data for current date already exist in db
        Criteria criteria = Criteria.where("id").is(id).andOperator(Criteria.where("workspace").is(workspace),Criteria.where("sessions").elemMatch(Criteria.where("date").is(date)));

        Query query2 = new Query(criteria);

        List<Document> resultExistingDate = template.find(query2, Document.class, "focus");

        if (resultExistingDate.isEmpty()){
            Document d = new Document();
            d.put("date", date);
            d.put("duration", duration);

            Update updateOps = new Update().push("sessions", d);

            UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "focus");

            return updateResult.getModifiedCount() > 0;
        }

        // if exist, override
        Update updateOps = new Update().inc("sessions.$.duration", duration);

        UpdateResult updateResult = template.updateFirst(query2, updateOps, Document.class, "focus");

        return updateResult.getModifiedCount() > 0;
    }

}
