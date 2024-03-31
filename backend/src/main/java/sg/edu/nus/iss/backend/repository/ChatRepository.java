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

import sg.edu.nus.iss.backend.exception.ChatListException;
import sg.edu.nus.iss.backend.exception.ChatRoomException;
import sg.edu.nus.iss.backend.model.ChatRoom;

@Repository
public class ChatRepository {
    
    @Autowired
    private MongoTemplate template;

    public ChatRoom getDetailsByRoomId(String roomId){

        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatroom");

        if (docs.isEmpty()){
            return null;
        }

        ChatRoom room = new ChatRoom();
        room = room.docToChatRoom(docs.getFirst());
        return room;
    }

    /*db.chatlist.aggregate([
    {
        $match: {
            id: "d73726d8"
        }
    },
    {
        $unwind: "$chats"
    },
    {
        $project: {
            _id: 0,
            roomId: "$chats.roomId",
            owner:"$chats.owner",
            name:"$chats.name",
            type:"$chats.type",
 
        }
    }
    ]);  */
    public List<ChatRoom> getAllChats(String id){

        MatchOperation matchOps = Aggregation.match(Criteria.where("id").is(id));

        AggregationOperation unwindOps = Aggregation.unwind("chats");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("chats.roomId").as("roomId")
                .and("chats.ownerId").as("ownerId")
                .and("chats.ownerName").as("ownerName")
                .and("chats.name").as("name")
                .and("chats.users").as("users")
                .and("chats.userCount").as("userCount")
                .and("chats.createDate").as("createDate")
                .and("chats.type").as("type");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "chatlist", Document.class);

        List<Document> docs = results.getMappedResults();

        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<ChatRoom> rooms = new LinkedList<>();
        docs.forEach(d -> {
            System.out.println(d.toJson());
            ChatRoom c = new ChatRoom();
            c = c.docToChatRoom(d);
            rooms.add(c);
        });

        return rooms;
    }

    public void addChatRoom(String id, ChatRoom room) throws ChatRoomException{
        // add into collection that contains all chatroom details
        Document insert = template.insert(room.toDoc(room), "chatroom");
        
        if (insert.isEmpty()){
            throw new ChatRoomException("error adding chatroom details into chatroom collection");
        }
    }

    public void createChatRoom(String id, ChatRoom room) throws ChatListException{

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()){
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");

            if (insert.isEmpty()){
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }

        Update updateOps = new Update().push("chats").value(room.toDoc(room));

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

        if (updateResult.getModifiedCount() == 0){
            throw new ChatListException("error adding chatroom details into chatlist collection");
        }
    }

    public boolean joinChatRoom(String id, String roomId){

        ChatRoom room = getDetailsByRoomId(roomId);
        if (room==null){
            return false;
        }

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()){
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");
            return !(insert.isEmpty());
        }

        //   db.chatlist.find({
        //      id: "d73726d8",
        //      "chats": {"$elemMatch": {"roomId": "811cc6"}}
        //   });

        // check if user has already joined the chat room
        Criteria criteria2 = Criteria.where("id").is(id)
            .andOperator(Criteria.where("chats").elemMatch(Criteria.where("roomId").is(roomId)));

        Query query2 = new Query(criteria2);

        List<Document> docs2 = template.find(query2, Document.class, "chatlist");

        // user is already in the chat room
        if (!docs2.isEmpty()){
            return false;
        }

        Update updateOps = new Update().push("chats").value(room.toDoc(room));

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

        return updateResult.getModifiedCount() > 0;
    }
}
