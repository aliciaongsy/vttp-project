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
        // KeyboardRow row1 = new KeyboardRow();
        // row1.add("workspace 1");
        // KeyboardRow row2 = new KeyboardRow();
        // row2.add("workspace 2");
        // KeyboardRow row3 = new KeyboardRow();
        // row3.add("workspace 3");
        // KeyboardRow row4 = new KeyboardRow();
        // row4.add("workspace 4");
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

    public static ReplyKeyboard taskActions(){
        InlineKeyboardButton edit = InlineKeyboardButton.builder().text("edit").callbackData("edit").build();
        InlineKeyboardButton complete = InlineKeyboardButton.builder().text("mark as complete").callbackData("markcomplete").build();
        return InlineKeyboardMarkup.builder().keyboardRow(List.of(edit)).keyboardRow(List.of(complete)).build();
    }
}
