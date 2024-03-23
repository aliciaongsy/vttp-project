package sg.edu.nus.iss.backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

}
