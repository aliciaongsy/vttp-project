package sg.edu.nus.iss.backend.telegram;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageReplyMarkup;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;

import sg.edu.nus.iss.backend.model.Task;

public class ResponseHandler {

    private final SilentSender sender;
    private final Map<Long, State> chatStates;
    private String email;
    private List<Task> tasks = new LinkedList<>();

    public ResponseHandler(SilentSender sender, DBContext db) {
        this.sender = sender;
        chatStates = db.getMap("chatStates");
    }

    public Map<Long, State> getChatStates() {
        return chatStates;
    }

    // --- commands ---
    // start
    public void replyToStart(long chatId, String user) {
        System.out.println("start");

        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(
                "hello %s,\nwelcome to task sync bot!\nto start, link to task application account".formatted(user));

        message.setReplyMarkup(KeyboardFactory.linkAccount());
        sender.execute(message);
    }

    public void accountLinked(long chatId, String user) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(
                "hello %s, welcome back!\nhere are the list of commands:\n/workspaces - get all workspaces\n/edit - edit task by workspace and task name\n/duesoon - get incomplete task with earliest due date\n/overduetask - get incomplete task that is overdue\n/outstandingtasks - get all outstanding tasks"
                        .formatted(user));
        sender.execute(message);
    }

    // linkaccount
    public void replyToLinkAccount(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("please input email");
        message.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(message);
        chatStates.put(chatId, State.AWAITING_EMAIL);
    }

    // workspaces
     public void replyToWorkspaces(long chatId, boolean linked, List<String> workspaces) {
        SendMessage message = new SendMessage();
        // check if user has been verified
        if (!linked) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            return;
        }

        if (workspaces.isEmpty()) {
            message.setChatId(chatId);
            message.setText("no existing workspace");
            sender.execute(message);
            return;
        }

        String text = "";
        for (String w: workspaces){
            text += w+"\n";
        }
        message.setChatId(chatId);
        message.setText("*list of workspaces:*\n"+text);
        message.setParseMode("Markdown");
        sender.execute(message);
    }

    // edittask
    public void replyToEditTask(long chatId, boolean linked, List<String> workspaces) {
        SendMessage message = new SendMessage();
        // check if user has been verified
        if (!linked) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            return;
        }

        if (workspaces.isEmpty()) {
            message.setChatId(chatId);
            message.setText("no existing workspace");
            sender.execute(message);
            return;
        }

        message.setChatId(chatId);
        message.setText("select workspace");
        message.setReplyMarkup(KeyboardFactory.getWorkspaces(workspaces));
        sender.execute(message);
        chatStates.put(chatId, State.AWAITING_WORKSPACE_SELECTION);
    }

    // duesoon
    public void replyToDueSoon(long chatId, boolean linked, Task task, String workspace){
        SendMessage message = new SendMessage();
        if (!linked) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            return;
        }
        String pattern = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        message.setChatId(chatId);
        message.setText("*task due soon:*\n*workspace:* %s\n*name:* %s\n*priority:* %s\n*status:* %s\n*start date:* %s\n*due date:* %s\n*completed:* _%b_\n"
            .formatted(workspace, task.getTask(), task.getPriority(), 
                task.getStatus(), simpleDateFormat.format(new Date(task.getStart())), 
                simpleDateFormat.format(new Date(task.getDue())),task.isCompleted()));
        message.setParseMode("Markdown");
        sender.execute(message);
    }

    // overduetask
    public void replyToOverdueTask(long chatId, boolean linked, List<Task> tasks, List<String> workspaces){
        SendMessage message = new SendMessage();
        if (!linked) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            return;
        }

        // no overdue task
        if (tasks.isEmpty()){
            message.setChatId(chatId);
            message.setText("no overdue task!");
            sender.execute(message);
            return;
        }

        String pattern = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        String text = "";
        for (int i = 0; i < tasks.size(); i++){
            String msg = "workspace: %s\nname: %s\npriority: %s\nstatus: %s\nstart date: %s\ndue date: %s\ncompleted: %b\n"
                .formatted(workspaces.get(i),tasks.get(i).getTask(), tasks.get(i).getPriority(), tasks.get(i).getStatus(), simpleDateFormat.format(new Date(tasks.get(i).getStart())), 
                    simpleDateFormat.format(new Date(tasks.get(i).getDue())), tasks.get(i).isCompleted());
            text += msg + "\n";
        }

        message.setChatId(chatId);
        message.setText("*task(s) overdue:*\n"+text);
        message.setParseMode("Markdown");
        sender.execute(message);
    }

    // outstandingtasks
    public void replyToOutstandingTasks(long chatId, boolean linked, List<Task> tasks, List<String> workspaces){
        SendMessage message = new SendMessage();
        if (!linked) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            return;
        }

        // no outstanding task
        if (tasks.isEmpty()){
            message.setChatId(chatId);
            message.setText("no outstanding task!");
            sender.execute(message);
            return;
        }

        String pattern = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        String text = "";
        String prevWs = workspaces.get(0);
        for (int i = 0; i < tasks.size(); i++){
            String currWs = workspaces.get(i);
            if (i == 0 || !prevWs.equals(currWs)){
                String msg = "\\[%s]\nname: %s\npriority: %s\nstatus: %s\nstart date: %s\ndue date: %s\ncompleted: %b\n"
                .formatted(workspaces.get(i),tasks.get(i).getTask(), tasks.get(i).getPriority(), tasks.get(i).getStatus(), simpleDateFormat.format(new Date(tasks.get(i).getStart())), 
                    simpleDateFormat.format(new Date(tasks.get(i).getDue())), tasks.get(i).isCompleted());
                text += msg + "\n";
                prevWs = currWs;
            }
            else {
                String msg = "name: %s\npriority: %s\nstatus: %s\nstart date: %s\ndue date: %s\ncompleted: %b\n"
                .formatted(tasks.get(i).getTask(), tasks.get(i).getPriority(), tasks.get(i).getStatus(), simpleDateFormat.format(new Date(tasks.get(i).getStart())), 
                    simpleDateFormat.format(new Date(tasks.get(i).getDue())), tasks.get(i).isCompleted());
                text += msg + "\n";
                prevWs = currWs;
            }
        }

        message.setChatId(chatId);
        message.setText("*task(s) outstanding:*\n"+text);
        message.setParseMode("Markdown");
        sender.execute(message);
    }

    // stop
    public void replyToStop(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText("goodbye!");
        chatStates.remove(chatId);
        sendMessage.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(sendMessage);
    }

    // --- reply ---
    public void replyToButtons(long chatId, Message message, Optional<List<Task>> opt) {
        System.out.println("reply");
        if (message.getText().equalsIgnoreCase("/stop")) {
            replyToStop(chatId);
            return;
        }

        switch (chatStates.get(chatId)) {
            case AWAITING_EMAIL -> replyToEmail(chatId, message);
            case AWAITING_ID -> replyToId(chatId, message);
            case AWAITING_WORKSPACE_SELECTION -> replyToSelectedWorkspace(chatId, message, opt.get());
            case AWAITING_TASK_SELECTION -> replyToSelectedTask(chatId, message);
            case AWAITING_EDIT -> replyToEdit(chatId, message, opt.get());
            default -> unexpectedMessage(chatId);
        }
    }

    // --- handle different chat states ---
    private void replyToEmail(long chatId, Message message) {
        email = message.getText();
        if (!email.contains("@")) {
            SendMessage sendMsg = new SendMessage();
            sendMsg.setChatId(chatId);
            sendMsg.setText("invalid email format! please try again");
            sender.execute(sendMsg);
            chatStates.put(chatId, State.AWAITING_EMAIL);
            return;
        }

        SendMessage sendMsg = new SendMessage();
        sendMsg.setChatId(chatId);
        sendMsg.setText("email verification completed!\nplease input id");
        sender.execute(sendMsg);
        chatStates.put(chatId, State.AWAITING_ID);

    }

    // if email does not exist
    public void checkEmail(long chatId) {
        System.out.println("sending error message");
        SendMessage sendMsg2 = new SendMessage();
        sendMsg2.setChatId(chatId);
        sendMsg2.setText("email does not exist in database\nplease try again");
        sender.execute(sendMsg2);
        chatStates.put(chatId, State.AWAITING_EMAIL);
        return;
    }

    public void replyToId(long chatId, Message message) {
        String id = message.getText().trim();

        if (id.length() != 8) {
            SendMessage sendMsg = new SendMessage();
            sendMsg.setChatId(chatId);
            sendMsg.setText("invalid id format: id has 8 characters.\nplease try again");
            sender.execute(sendMsg);
            chatStates.put(chatId, State.AWAITING_ID);
            return;
        }

        SendMessage sendMsg = new SendMessage();
        sendMsg.setChatId(chatId);
        sendMsg.setText("user verification completed!\nwelcome user!");
        sender.execute(sendMsg);
        chatStates.put(chatId, State.COMPLETE_VERIFICATION);
        completeVerification(chatId);

    }

    // if id is incorrect
    public void checkId(long chatId) {
        System.out.println("sending error message");
        SendMessage sendMsg2 = new SendMessage();
        sendMsg2.setChatId(chatId);
        sendMsg2.setText("incorrect id\nplease try again");
        sender.execute(sendMsg2);
        chatStates.put(chatId, State.AWAITING_EMAIL);
        return;
    }

    public void replyToSelectedWorkspace(long chatId, Message message, List<Task> tasks) {
        this.tasks = tasks;

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText("select task");
        msg.setReplyMarkup(KeyboardFactory.getTasks(tasks));
        sender.execute(msg);
        chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
    }

    public void replyToSelectedTask(long chatId, Message message) {

        String selectedTask = message.getText().trim();

        Task task = new Task();
        for (Task t : tasks) {
            if (t.getTask().equals(selectedTask)) {
                task = t;
            }
        }

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);

        String pattern = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        msg.setText(
                "*task details:*\n*id:* %s\n*name:* %s\n*priority:* %s\n*status:* %s\n*start date:* %s\n*due date:* %s\n*completed:* _%b_"
                        .formatted(task.getId(), task.getTask(), task.getPriority(), task.getStatus(),
                                simpleDateFormat.format(new Date(task.getStart())),
                                simpleDateFormat.format(new Date(task.getDue())),
                                task.isCompleted()));
        msg.setReplyMarkup(new ReplyKeyboardRemove(true));
        msg.setParseMode("Markdown");
        msg.setReplyMarkup(KeyboardFactory.taskActions());
        sender.execute(msg);
        chatStates.put(chatId, State.DISPLAY_TASK);
    }

    public void replyToEdit(long chatId, Message message, List<Task> tasks) {

        SendMessage msg = new SendMessage();
        // only update tasks list on successful edit
        if (!tasks.isEmpty()) {
            this.tasks = tasks;
            msg.setChatId(chatId);
            msg.setText("successfully updated task details!\nchoose another task to view or press /stop to cancel");
            msg.setReplyMarkup(KeyboardFactory.getTasks(tasks));
            
        }
        else{
            msg.setChatId(chatId);
            msg.setText("error updating task! select task and try again.");
            msg.setReplyMarkup(KeyboardFactory.getTasks(this.tasks));
        }

        sender.execute(msg);
        chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
        
    }

    public void replyToValidationError(long chatId, String error){
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        switch (error) {
            case "task length":
                message.setText("name must contain at least 3 characters\nplease input name again");
                message.setReplyMarkup(new ReplyKeyboardRemove(true));
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                
                break;

            case "date format":
                message.setText("incorrect date format\nplease input date in \"dd/MM/yyyy\" format");
                message.setReplyMarkup(new ReplyKeyboardRemove(true));
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "past date":
                message.setText("due date cannot be earlier than today\nplease input the correct date");
                message.setReplyMarkup(new ReplyKeyboardRemove(true));
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;
        
            default:
                break;
        }
    }

    // --- task actions ---
    public void replyToEdit(long chatId, int messageId) {

        EditMessageReplyMarkup message = new EditMessageReplyMarkup();
        message.setChatId(chatId);
        message.setMessageId(messageId);
        message.setReplyMarkup(KeyboardFactory.editTasks());
        sender.execute(message);

    }

    public void replyToCompletedTask(long chatId, boolean completeStatus, boolean updateStatus) {
        SendMessage message = new SendMessage();

        // task already completed
        if (completeStatus) {
            message.setChatId(chatId);
            message.setText("task is already completed, unable to process action\nchoose another task or press /stop to cancel");
            message.setReplyMarkup(KeyboardFactory.getTasks(tasks));
            sender.execute(message);
            chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
            return;
        }

        // successful update
        if (updateStatus) {
            message.setChatId(chatId);
            message.setText("successfully marked task as completed!\nchoose another task or press /stop to cancel");
            message.setReplyMarkup(KeyboardFactory.getTasks(tasks));
            sender.execute(message);
            chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
            return;
        }

        // error updating
        if (!updateStatus) {
            message.setChatId(chatId);
            message.setText("error marking task as complete");
            message.setReplyMarkup(new ReplyKeyboardRemove(true));
            sender.execute(message);
            return;
        }

    }

    public void replyToEditVariable(long chatId, String variable, int messageId) {
        SendMessage message = new SendMessage();

        switch (variable) {
            case "task":
                message.setChatId(chatId);
                message.setText("input new task name (min 3 characters)");
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "status":
                message.setChatId(chatId);
                message.setText("select status");
                message.setReplyMarkup(KeyboardFactory.getStatusKeyboard());
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "priority":
                message.setChatId(chatId);
                message.setText("select priority");
                message.setReplyMarkup(KeyboardFactory.getPriorityKeyboard());
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "complete":
                message.setChatId(chatId);
                message.setText("select true or false");
                message.setReplyMarkup(KeyboardFactory.getTrueOrFalse());
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "start":
            case "due":
                message.setChatId(chatId);
                message.setText("input new date in dd/MM/yyyy format");
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;

            case "back":
                EditMessageReplyMarkup msg = new EditMessageReplyMarkup();
                msg.setChatId(chatId);
                msg.setMessageId(messageId);
                msg.setReplyMarkup(KeyboardFactory.taskActions());
                sender.execute(msg);
                break;

            default:
                message.setChatId(chatId);
                message.setText("input new value for task's %s".formatted(variable));
                sender.execute(message);
                chatStates.put(chatId, State.AWAITING_EDIT);
                break;
        }

    }

    // handle unexpected message
    private void unexpectedMessage(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText("unexpected message");
        sender.execute(sendMessage);
    }

    // end verification process
    public void completeVerification(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText("successfully linked to task application\n/workspaces - get all workspaces\n" + //
                "/edit - edit task by workspace and task name\n" + //
                "/duesoon - get incomplete task with earliest due date\n" + //
                "/overduetask - get incomplete task that is overdue\n" + //
                "/outstandingtasks - get all outstanding tasks");
        chatStates.remove(chatId);
        sendMessage.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(sendMessage);
    }

    public boolean userIsActive(Long chatId) {
        return chatStates.containsKey(chatId);
    }
}
