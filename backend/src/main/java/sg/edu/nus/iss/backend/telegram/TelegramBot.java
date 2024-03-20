package sg.edu.nus.iss.backend.telegram;

import static org.telegram.abilitybots.api.objects.Locality.USER;
import static org.telegram.abilitybots.api.objects.Privacy.PUBLIC;
// import static org.telegram.abilitybots.api.util.AbilityUtils.getChatId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.abilitybots.api.objects.Ability;

@Component
public class TelegramBot extends AbilityBot {

    private final ResponseHandler responseHandler;

    @Value("${telegram.bot.token}")
    private String botToken;

    public TelegramBot(Environment env) {
        super(env.getProperty("telegram.bot.token"), "tasks_sync_bot");
        responseHandler = new ResponseHandler(silent, db);
    }

    @Override
    public String getBotToken() {
        System.out.println(botToken);
        return botToken;
    }

    @Override
    public long creatorId() {
        return 1L;
    }

    // when start command is pressed
    public Ability startBot() {
        System.out.println("start bot");
        return Ability
                .builder()
                .name("start")
                .info("start bot")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToStart(ctx.chatId(), ctx.user().getFirstName()))
                .build();
    }

    public Ability loginBot() {
        System.out.println("login bot");
        return Ability
                .builder()
                .name("linkaccount")
                .info("link account")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToLinkAccount(ctx.chatId()))
                .build();
    }

    // handle replies
    // public Reply replyToButtons() {
    //     BiConsumer<BaseAbilityBot, Update> action = (abilityBot, upd) -> responseHandler.replyToButtons(getChatId(upd),
    //             upd.getMessage());
    //     return Reply.of(action, Flag.TEXT, upd -> responseHandler.userIsActive(getChatId(upd)));
    // }


}
