package sg.edu.nus.iss.backend.telegram;

import java.util.List;
import java.util.Map;

import org.telegram.abilitybots.api.db.DBContext;
import org.telegram.abilitybots.api.sender.SilentSender;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboard;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

public class ResponseHandler {

    private final SilentSender sender;
    private final Map<Long, State> chatStates;

    public ResponseHandler(SilentSender sender, DBContext db) {
        this.sender = sender;
        chatStates = db.getMap("chatStates");
    }

    public void replyToStart(long chatId, String user) {
        System.out.printf("user: %s", user);
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("hello %s,\nwelcome to task sync bot!\nto start, link to task application account".formatted(user));

        InlineKeyboardButton button = InlineKeyboardButton.builder().text("link account").callbackData("linkaccount").build();
        InlineKeyboardMarkup keyboard = InlineKeyboardMarkup.builder().keyboardRow(List.of(button)).build();
        message.setReplyMarkup(keyboard);
        
        sender.execute(message);
        chatStates.put(chatId, State.START_BOT);
    }

    public void replyToLinkAccount(long chatId){
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("input email");
        sender.execute(message);
        chatStates.put(chatId, State.AWAITING_EMAIL);
    }

    public void replyToButtons(long chatId, Message message) {
        if (message.getText().equalsIgnoreCase("/stop")) {
            stopChat(chatId);
        }

        switch (chatStates.get(chatId)) {
            case AWAITING_EMAIL -> replyToEmail(chatId, message);
            case AWAITING_ID -> replyToId(chatId, message);
            case EDIT_TASK -> replyToEditTask(chatId, message);
            case COMPLETE_TASK -> replyToCompleteTask(chatId, message);
            default -> unexpectedMessage(chatId);
        }
    }

    private void promptWithKeyboardForState(long chatId, String text, ReplyKeyboard YesOrNo, State awaitingReorder) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText(text);
        sendMessage.setReplyMarkup(YesOrNo);
        sender.execute(sendMessage);
        chatStates.put(chatId, awaitingReorder);
    }

    public void unexpectedMessage(long chatId) {

    }

    public void replyToEmail(long chatId, Message message) {
        System.out.println(message);
    }

    public void replyToId(long chatId, Message message) {

    }

    public void replyToEditTask(long chatId, Message message) {

    }

    public void replyToCompleteTask(long chatId, Message message) {

    }

    public void stopChat(long chatId) {

    }

    public boolean userIsActive(Long chatId) {
        return chatStates.containsKey(chatId);
    }
}
