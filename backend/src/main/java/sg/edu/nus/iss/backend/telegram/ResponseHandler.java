package sg.edu.nus.iss.backend.telegram;

import java.util.Map;

import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;

public class ResponseHandler {

    private final SilentSender sender;
    private final Map<Long, State> chatStates;
    private boolean verified = false;
    private String email;

    public ResponseHandler(SilentSender sender, DBContext db) {
        this.sender = sender;
        chatStates = db.getMap("chatStates");
    }

    public void replyToStart(long chatId, String user) {
        System.out.println("start");

        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(
                "hello %s,\nwelcome to task sync bot!\nto start, link to task application account".formatted(user));

        // InlineKeyboardButton button = InlineKeyboardButton.builder().text("link
        // account").callbackData("linkaccount").build();
        // InlineKeyboardMarkup keyboard =
        // InlineKeyboardMarkup.builder().keyboardRow(List.of(button)).build();

        message.setReplyMarkup(KeyboardFactory.linkAccount());
        sender.execute(message);
        // chatStates.put(chatId, AWAITING_NAME);
    }

    public void replyToLinkAccount(long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("please input email");
        message.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(message);
        chatStates.put(chatId, State.AWAITING_EMAIL);
    }

    public void replyToWorkspaces(long chatId) {
        SendMessage message = new SendMessage();
        // check if user has been verified
        if (!verified) {
            message.setChatId(chatId);
            message.setText("please link account to proceed");
            message.setReplyMarkup(KeyboardFactory.linkAccount());
            sender.execute(message);
            // chatStates.put(chatId, AWAITING_EMAIL);
            return;
        }
        message.setChatId(chatId);
        message.setText("select workspace");
        message.setReplyMarkup(KeyboardFactory.getWorkspaces());
        sender.execute(message);
        chatStates.put(chatId, State.AWAITING_WORKSPACE_SELECTION);
    }

    public void replyToButtons(long chatId, Message message) {
        System.out.println("reply");
        if (message.getText().equalsIgnoreCase("/stop")) {
            stopChat(chatId);
            return;
        }

        switch (chatStates.get(chatId)) {
            case AWAITING_EMAIL -> replyToEmail(chatId, message);
            case AWAITING_ID -> replyToId(chatId, message);
            // case VERIFYING_EMAIL -> checkDatabase(chatId);
            // case AWAITING_ID -> replyToId(chatId, message);
            case AWAITING_WORKSPACE_SELECTION -> replyToSelectedWorkspace(chatId, message);
            case AWAITING_TASK_SELECTION -> replyToSelectedTask(chatId, message);
            default -> unexpectedMessage(chatId);
        }
    }

    private void unexpectedMessage(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText("unexpected message");
        sender.execute(sendMessage);
    }

    private void stopChat(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText("goodbye!");
        chatStates.remove(chatId);
        sendMessage.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(sendMessage);
    }

    public void completeVerification(long chatId) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText(
                "successfully linked to task application\n/workspaces - get all workspaces\n/edittask - edit task by workspace and task name\n/markcompleted - mark task as completed");
        chatStates.remove(chatId);
        sendMessage.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(sendMessage);
    }

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
            chatStates.put(chatId, State.VERIFYING_EMAIL);
            return;
        }

        SendMessage sendMsg = new SendMessage();
        sendMsg.setChatId(chatId);
        sendMsg.setText("verifying id %s ... please wait".formatted(id));
        sender.execute(sendMsg);

        SendMessage sendMsg2 = new SendMessage();
        sendMsg2.setChatId(chatId);
        sendMsg2.setText("user verification completed!\nwelcome user!");
        sender.execute(sendMsg2);
        chatStates.put(chatId, State.COMPLETE_VERIFICATION);
        verified = true;
        completeVerification(chatId);
    }

    public void replyToSelectedWorkspace(long chatId, Message message) {
        String workspace = message.getText().trim();
        System.out.printf("selected workspace: %s\n", workspace);
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText("select task");
        msg.setReplyMarkup(KeyboardFactory.getTasks());
        sender.execute(msg);
        chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
    }

    public void replyToSelectedTask(long chatId, Message message) {
        String task = message.getText().trim();
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText("display task");
        msg.setReplyMarkup(new ReplyKeyboardRemove(true));
        sender.execute(msg);
        chatStates.put(chatId, State.AWAITING_TASK_SELECTION);
    }

    public boolean userIsActive(Long chatId) {
        return chatStates.containsKey(chatId);
    }
}
