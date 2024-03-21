package sg.edu.nus.iss.backend.telegram;

import static org.telegram.abilitybots.api.objects.Locality.USER;
import static org.telegram.abilitybots.api.objects.Privacy.PUBLIC;
import static org.telegram.abilitybots.api.util.AbilityUtils.getChatId;

import java.util.function.BiConsumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.abilitybots.api.bot.BaseAbilityBot;
import org.telegram.abilitybots.api.objects.Ability;
import org.telegram.abilitybots.api.objects.Flag;
import org.telegram.abilitybots.api.objects.Reply;
import org.telegram.telegrambots.meta.api.objects.Update;

import sg.edu.nus.iss.backend.service.TelegramService;

@Component
public class TelegramBot extends AbilityBot {

    private final ResponseHandler responseHandler;

    // @Value("${telegram.bot.token}")
    // private String botToken;

    @Autowired
    private TelegramService teleSvc;

    public TelegramBot(Environment environment) {
        super(environment.getProperty("telegram.bot.token"), "tasks_sync_bot");
        responseHandler = new ResponseHandler(silent, db);
    }

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

    public Ability linkBot() {
        System.out.println("link bot");
        return Ability
                .builder()
                .name("linkaccount")
                .info("link account")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToLinkAccount(ctx.chatId()))
                .build();
    }

    public Ability workspaceBot() {
        System.out.println("link bot");
        return Ability
                .builder()
                .name("workspaces")
                .info("get all workspaces")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToWorkspaces(ctx.chatId()))
                .build();
    }

    public Reply replyToButtons() {
        System.out.println("enter reply");
        BiConsumer<BaseAbilityBot, Update> action = (abilityBot, upd) -> {
            if (upd.getMessage().getText().contains("@") && upd.getMessage().getText().length() > 5) {
                System.out.println("email check here?");
                boolean existingUser = this.teleSvc.checkUserExistInDatabase(upd.getMessage().getText());
                System.out.println(existingUser);
                if(!existingUser){
                    responseHandler.checkEmail(getChatId(upd));
                    return;
                }
            }
            responseHandler.replyToButtons(getChatId(upd), upd.getMessage());
        };
        return Reply.of(action, Flag.TEXT, upd -> responseHandler.userIsActive(getChatId(upd)));
    }

    @Override
    public long creatorId() {
        return 1L;
    }

}
