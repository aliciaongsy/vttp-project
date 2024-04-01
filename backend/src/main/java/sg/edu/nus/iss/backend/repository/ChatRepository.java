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
import sg.edu.nus.iss.backend.model.ChatMessage;
import sg.edu.nus.iss.backend.model.ChatRoom;

@Repository
public class ChatRepository {

    @Autowired
    private MongoTemplate template;

    // --- chat room ---
    public ChatRoom getDetailsByRoomId(String roomId) {

        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatroom");

        if (docs.isEmpty()) {
            return null;
        }

        ChatRoom room = new ChatRoom();
        room = room.docToChatRoom(docs.getFirst());
        return room;
    }

    /*  db.chatlist.aggregate([
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
    ]);*/
    public List<ChatRoom> getAllChats(String id) {

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
            c = c.docToChatRoom2(d);
            rooms.add(c);
        });

        return rooms;
    }

    public void addChatRoom(String id, ChatRoom room) throws ChatRoomException {
        // add into collection that contains all chatroom details
        Document insert = template.insert(room.toDoc(room), "chatroom");

        if (insert.isEmpty()) {
            throw new ChatRoomException("error adding chatroom details into chatroom collection");
        }
    }

    public void createChatRoom(String id, ChatRoom room) throws ChatListException {

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()) {
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc2(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");

            if (insert.isEmpty()) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }

        } else {
            Update updateOps = new Update().push("chats").value(room.toDoc2(room));

            UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

            if (updateResult.getModifiedCount() == 0) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
    }

    public void addNewUser(String roomId, String id) throws ChatListException {
        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        Update updateOps = new Update().push("users").value(id).inc("userCount", 1);

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatroom");

        if (updateResult.getModifiedCount() == 0) {
            throw new ChatListException("error adding chatroom details into chatlist collection");
        }
    }

    public void joinChatRoom(String id, String roomId) throws ChatListException, ChatRoomException {

        // chat if it is a valid room id
        ChatRoom room = getDetailsByRoomId(roomId);
        if (room == null) {
            throw new ChatRoomException("chatroom does not exist");
        }

        Criteria criteria = Criteria.where("id").is(id);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatlist");

        if (docs.isEmpty()) {
            List<Document> chats = new ArrayList<>();
            chats.add(room.toDoc2(room));

            Document doc = new Document();
            doc.put("id", id);
            doc.put("chats", chats);
            Document insert = template.insert(doc, "chatlist");
            if (insert.isEmpty()) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
        else{
            // db.chatlist.find({
            // id: "d73726d8",
            // "chats": {"$elemMatch": {"roomId": "811cc6"}}
            // });

            // check if user has already joined the chat room
            Criteria criteria2 = Criteria.where("id").is(id)
                    .andOperator(Criteria.where("chats").elemMatch(Criteria.where("roomId").is(roomId)));

            Query query2 = new Query(criteria2);

            List<Document> docs2 = template.find(query2, Document.class, "chatlist");

            // user is already in the chat room
            if (!docs2.isEmpty()) {
                throw new ChatListException("user is already in the chat room");
            }

            Update updateOps = new Update().push("chats").value(room.toDoc2(room));

            UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatlist");

            if (updateResult.getModifiedCount() == 0) {
                throw new ChatListException("error adding chatroom details into chatlist collection");
            }
        }
    }

    // --- chat messages ---
    /*  db.chatmessage.aggregate([
    {
        $match: {
            roomId: "d73726d8"
        }
    },
    {
        $unwind: "$messages"
    },
    {
        $project: {
            _id: 0,
            content: "$messages.content",
            sender: "$messages.sender",
            type: "$messages.type",
            timestamp: "$messages.timestamp"
        }
    }
    ]);*/
    public List<ChatMessage> getAllMessagesByRoomId(String roomId) {

        MatchOperation matchOps = Aggregation.match(Criteria.where("roomId").is(roomId));

        AggregationOperation unwindOps = Aggregation.unwind("messages");

        ProjectionOperation projectOps = Aggregation.project()
                .andExclude("_id")
                .and("messages.content").as("content")
                .and("messages.sender").as("sender")
                .and("messages.type").as("type")
                .and("messages.timestamp").as("timestamp");

        Aggregation pipeline = Aggregation.newAggregation(matchOps, unwindOps, projectOps);

        AggregationResults<Document> results = template.aggregate(pipeline, "chatmessage", Document.class);

        List<Document> docs = results.getMappedResults();

        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<ChatMessage> messages = new LinkedList<>();
        docs.forEach(d -> {
            ChatMessage m = new ChatMessage();
            m = m.docToChatMessage(d);
            messages.add(m);
        });

        return messages;
    }

    public boolean saveMessages(String roomId, ChatMessage message) {
        Criteria criteria = Criteria.where("roomId").is(roomId);
        Query query = new Query(criteria);

        List<Document> docs = template.find(query, Document.class, "chatmessage");

        if (docs.isEmpty()) {
            List<Document> messages = new ArrayList<>();
            messages.add(message.toDoc(message));

            Document doc = new Document();
            doc.put("roomId", roomId);
            doc.put("messages", messages);
            Document insert = template.insert(doc, "chatmessage");
            return !(insert.isEmpty());
        }

        Update updateOps = new Update().push("messages").value(message.toDoc(message));

        UpdateResult updateResult = template.updateFirst(query, updateOps, Document.class, "chatmessage");

        return updateResult.getModifiedCount() > 0;
    }
}
