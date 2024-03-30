package sg.edu.nus.iss.backend.service;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.backend.model.Task;
import sg.edu.nus.iss.backend.repository.TaskRepository;
import sg.edu.nus.iss.backend.repository.UserRepository;

@Service
public class TelegramService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private TaskRepository taskRepo;

    // --- user repository ---
    public boolean checkLinkedAccount(long chatid){
        return userRepo.checkIfAccountIsLinked(Long.toString(chatid));
    }
    
    public boolean checkUserExistInDatabase(String email){
        System.out.println("in telegram service");
        return userRepo.existingUser(email);
    }

    public boolean checkUserId(String email, String id){
        return userRepo.checkEmailAndId(email, id);
    }

    public String getUserIdByChatId(long chatid){
        return userRepo.getUserIdByChatid(Long.toString(chatid));
    }

    public boolean addTelegramDetails(long chatid, String username, String email, String id){
        return userRepo.addTelegramDetails(Long.toString(chatid), username, email, id);
    }

    // --- task repository ---
    public List<String> getWorkspacesById(String id){
        return taskRepo.getWorkspacesById(id);
    }

    public List<Task> getAllTasks(String id, String workspace){
        Comparator<Task> comparator = Comparator.comparing(t -> t.getTask());
        return taskRepo.getAllTasks(id, workspace).stream().sorted(comparator).collect(Collectors.toList());
    }

    public boolean updateCompleteStatus(String id, String workspace, String taskId, boolean complete){
        return taskRepo.updateCompleteStatus(id, workspace, taskId, complete);
    }

    public boolean updateTaskDetails(String id, String workspace, String taskId, String variable, String value){
        return taskRepo.updateTaskByAttribute(id, workspace, taskId, variable, value);
    }

    public Task getTaskDueSoon(String id){
        Document doc = taskRepo.getIncompleteTaskDueSoon(id);
        Task task = new Task();
        if (!doc.isEmpty()){
            task = task.convertDocToTask(doc);
        }
        return task;
    }

    public String getTaskDueSoonWorkspace(String id){
        Document doc = taskRepo.getIncompleteTaskDueSoon(id);
        if (doc.isEmpty()){
            return "";
        }
        return doc.getString("workspace");
    }

    public List<Task> getOverdueTask(String id){
        List<Document> docs = taskRepo.getOverdueTask(id);
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<Task> tasks = new LinkedList<>();
        docs.forEach(d -> {
            Task t = new Task();
            t = t.convertDocToTask(d);
            tasks.add(t);
        });

        return tasks;
    }

    public List<String> getOverdueTaskWorkspace(String id){
        List<Document> docs = taskRepo.getOverdueTask(id);
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<String> workspaces = new LinkedList<>();
        docs.forEach(d -> {
            String w = d.getString("workspace");
            workspaces.add(w);
        });

        return workspaces;
    }

    public List<Task> getOutstandingTasks(String id){
        List<Document> docs = taskRepo.getOutstandingTasks(id);
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<Task> tasks = new LinkedList<>();
        docs.forEach(d -> {
            Task t = new Task();
            t = t.convertDocToTask(d);
            tasks.add(t);
        });

        return tasks;
    }

     public List<String> getOutstandingTasksWorkspace(String id){
        List<Document> docs = taskRepo.getOutstandingTasks(id);
        if (docs.isEmpty()) {
            return new LinkedList<>();
        }

        List<String> workspaces = new LinkedList<>();
        docs.forEach(d -> {
            String w = d.getString("workspace");
            workspaces.add(w);
        });

        return workspaces;
    }

}
