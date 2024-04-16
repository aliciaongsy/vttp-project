package sg.edu.nus.iss.backend.telegram;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.backend.model.Reminder;
import sg.edu.nus.iss.backend.model.Task;

@Service
public class RemindersService {
    
    private static Logger logger = Logger.getLogger(RemindersService.class.getName());
    private String chatId;
    
    @Autowired
    private RemindersStore remindersStore;

    public void setChatId(String chatId){
        this.chatId = chatId;
    }

    // run this when we add new tasks
    public void addNewReminder(String chatId, Task task){
        saveReminders(new Reminder(chatId, task.getId(), task.getTask(), task.getDue()));
    }

    public void deleteReminder(String chatId, String taskId){
        remindersStore.deleteReminders(taskId);
    }

    public void saveReminders(Reminder reminder){
        chatId = reminder.getChatId();
        logger.log(Level.INFO, "saving reminders");
        remindersStore.saveReminders(reminder);
    }

    public List<Reminder> getAllReminders(){
        if (chatId==null){
            System.out.println("chat id is null");
            return new ArrayList<>();
        }
        List<Reminder> reminders = remindersStore.getAllReminders(chatId);
        return reminders;
    }

    public void markComplete(Reminder reminder){
        remindersStore.markComplete(reminder);
    }
}

