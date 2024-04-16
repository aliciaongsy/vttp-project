package sg.edu.nus.iss.backend.telegram;

import java.util.LinkedList;
import java.util.List;

import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboard;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;

import sg.edu.nus.iss.backend.model.Task;

public class KeyboardFactory {
    public static ReplyKeyboard linkAccount() {
        KeyboardRow row = new KeyboardRow();
        row.add("/linkaccount");
        return new ReplyKeyboardMarkup(List.of(row));
    }

    public static ReplyKeyboard getWorkspaces(List<String> workspaces) {
        List<KeyboardRow> keyboardRows = new LinkedList<>();
        for (String w : workspaces) {
            KeyboardRow row = new KeyboardRow();
            row.add(w);
            keyboardRows.add(row);
        }
        return ReplyKeyboardMarkup.builder().keyboard(keyboardRows).build();
    }

    public static ReplyKeyboard getTasks(List<Task> tasks) {
        List<KeyboardRow> keyboardRows = new LinkedList<>();
        for (Task t : tasks) {
            KeyboardRow row = new KeyboardRow();
            row.add(t.getTask());
            keyboardRows.add(row);
        }
        return ReplyKeyboardMarkup.builder().keyboard(keyboardRows).build();
    }

    public static InlineKeyboardMarkup taskActions() {
        InlineKeyboardButton edit = InlineKeyboardButton.builder().text("edit").callbackData("edit").build();
        InlineKeyboardButton complete = InlineKeyboardButton.builder().text("mark as complete")
                .callbackData("markcomplete").build();
        return InlineKeyboardMarkup.builder().keyboardRow(List.of(edit)).keyboardRow(List.of(complete)).build();
    }

    public static InlineKeyboardMarkup editTasks() {
        InlineKeyboardButton name = InlineKeyboardButton.builder().text("name").callbackData("task").build();
        InlineKeyboardButton priority = InlineKeyboardButton.builder().text("priority").callbackData("priority")
                .build();
        InlineKeyboardButton[] row1 = new InlineKeyboardButton[] { name, priority };

        InlineKeyboardButton status = InlineKeyboardButton.builder().text("status").callbackData("status").build();
        InlineKeyboardButton start = InlineKeyboardButton.builder().text("start").callbackData("start").build();
        InlineKeyboardButton[] row2 = new InlineKeyboardButton[] { status, start };

        InlineKeyboardButton due = InlineKeyboardButton.builder().text("due").callbackData("due").build();
        InlineKeyboardButton complete = InlineKeyboardButton.builder().text("complete").callbackData("complete")
                .build();
        InlineKeyboardButton[] row3 = new InlineKeyboardButton[] { due, complete };

        InlineKeyboardButton back = InlineKeyboardButton.builder().text("back").callbackData("back").build();

        return InlineKeyboardMarkup.builder().keyboardRow(List.of(row1)).keyboardRow(List.of(row2))
                .keyboardRow(List.of(row3)).keyboardRow(List.of(back)).build();
    }

    public static ReplyKeyboard getStatusKeyboard() {
        KeyboardRow row1 = new KeyboardRow();
        row1.add("In Progress");
        KeyboardRow row2 = new KeyboardRow();
        row2.add("In Review");
        KeyboardRow row3 = new KeyboardRow();
        row3.add("On Hold");
        KeyboardRow row4 = new KeyboardRow();
        row4.add("Completed");
        return ReplyKeyboardMarkup.builder().keyboardRow(row1).keyboardRow(row2).keyboardRow(row3).keyboardRow(row4).build();
    }

    public static ReplyKeyboard getPriorityKeyboard(){
        KeyboardRow row1 = new KeyboardRow();
        row1.add("Low");
        KeyboardRow row2 = new KeyboardRow();
        row2.add("Medium");
        KeyboardRow row3 = new KeyboardRow();
        row3.add("High");
        return ReplyKeyboardMarkup.builder().keyboardRow(row1).keyboardRow(row2).keyboardRow(row3).build();
    }

    public static ReplyKeyboard getTrueOrFalse() {
        KeyboardRow t = new KeyboardRow();
        t.add("true");
        KeyboardRow f = new KeyboardRow();
        f.add("false");
        return ReplyKeyboardMarkup.builder().keyboardRow(t).keyboardRow(f).build();
    }

    
}
