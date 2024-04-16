package sg.edu.nus.iss.backend.telegram;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import sg.edu.nus.iss.backend.model.Reminder;

@Component
public class RemindersStore {

    @Autowired
    private MongoTemplate template;

    private List<Reminder> reminders = new ArrayList<>();

    public void saveReminders(Reminder reminder) {

        Criteria criteria = Criteria.where("taskId").is(reminder.getTaskId());
        Query query = new Query(criteria);
        List<Document> docs = template.find(query, Document.class, "reminders");

        
        if (docs.isEmpty()){
            System.out.println("saving reminder: "+reminder.toString());
            template.insert(reminder.toDoc(reminder), "reminders");
        }

        // if task id already exist in reminders db - replace data
        Update update = new Update().set("message", reminder.getMessage())
            .set("task", reminder.getTask())
            .set("due", reminder.getDue());

        System.out.println("updating reminder: "+reminder.toString());
        template.updateFirst(query, update, "reminders");

    }

    public void deleteReminders(String taskId){
        Criteria criteria = Criteria.where("taskId").is(taskId);
        Query query = new Query(criteria);
        template.remove(query, "reminders");
    }

    public List<Reminder> getAllReminders(String chatId) {

        reminders = new ArrayList<>();

        Criteria criteria = Criteria.where("chatId").is(chatId);
        Query query = new Query(criteria);
        List<Document> docs = template.find(query, Document.class, "reminders");

        docs.forEach(d -> {
            Reminder r = new Reminder();
            r = r.toReminder(d);
            reminders.add(r);
        });

        System.out.println(reminders);

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Singapore"));
        // cal.set(Calendar.HOUR_OF_DAY, 0);
        // cal.set(Calendar.MINUTE, 0);
        // cal.set(Calendar.SECOND, 0);
        // cal.set(Calendar.MILLISECOND, 0);
        // long from = cal.getTime().getTime();
        // System.out.println(from);

        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        long to = cal.getTime().getTime();
        System.out.println(to);

        List<Reminder> list = new ArrayList<>();
        for (Reminder r : reminders){
            if (r.getDue() <= to && Boolean.FALSE.equals(r.isCompleted())){
                System.out.println("adding reminder into list: "+ r.toString());
                list.add(r);
            }
        }

        return list;

        // return reminders
        //         .stream()
        //         .filter(r -> r.getDue() >= from && r.getDue() <= to && r.isCompleted() == false)
        //         .toList();
    }

    public void markComplete(Reminder reminder) {

        Criteria criteria = Criteria.where("taskId").is(reminder.getTaskId());
        Query query = new Query(criteria);

        Update update = new Update().set("completed", true);

        template.updateFirst(query, update, "reminders");

        reminders.stream()
                .map(r -> {
                    if (r.getTaskId().equals(reminder.getTaskId())) {
                        r.setCompleted(true);
                    }
                    return r;
                })
                .toList();
    }
}
