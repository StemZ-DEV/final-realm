import chalk from "chalk";
import figlet from "figlet";

export function showTitle() {
  console.clear();
  console.log(
    chalk.blueBright(
      figlet.textSync("Final Realm", { horizontalLayout: "full" }),
    ),
    chalk.gray("Inspired by Final Realm by Syxmbl"),
  );
  console.log(chalk.greenBright("Welcome back, traveler!"));
}
