var Botkit = require('botkit');
var os = require('os');
var request = require('request');

var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: getVar("SLACK_TOKEN")
});

// slack's api only gives these weird codes instead of usernames :(
var owners = [ "U0EGDRXEK" ];
var meekan_user = "U0GQF3PTL";
var annoyingness_channel = "C0L6XQ3FS";
var hexme = [ "U0G281Q8L", "U0EGDRXEK", "U0EGTKEFM"];
var chat_channel = "C0MS09H2L";
var dotdotdot_channel = "C0Q1B69HT";
var logoEmoji = "planhub";

var phIntToken = getVar("PH_INT_TOKEN");

bot.startRTM(function(err,bot,payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}
	controller.hears(["^hexy_hello$"],["direct_message","direct_mention","mention"],function(bot,message) {
		bot.api.reactions.add({
			timestamp: message.ts,
			channel: message.channel,
			name: 'robot_face',
		},function(err, res) {
			if (err) {
				bot.botkit.log('Failed to add emoji reaction :(',err);
			}
		});
		bot.startConversation(message,function(err,convo) {
			convo.ask('hexy_hello! How\'s the weather today?',function(response,convo) {
				convo.say("Really? I'm a bot, so I don't care.");
				convo.next();
			});
		});
	});

	controller.hears(["broswers", "fialls", "jabascript", "outpot"],'ambient',function(bot, message) {
		bot.reply(message, 'lel speling iz inded harrd');
	});
	
	controller.hears(["LEWL"],'ambient',function(bot, message) {
		bot.reply(message, '*_LEWL_*');
	});

	controller.hears(["shiny", "prettyful"],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, ":sparkles: Shiny and prettyful is good.");
	});

	controller.hears(["hi", "hai", "hello", "helo"],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, 'Hai thar, *Hexr*!');
	});
	
	controller.hears(['ping'],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, 'Pong!');
	});

	controller.hears(['identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, 'I am *PlanBot*! Not to be confused with https://github.com/PlanHubMe/PlanHub/issues/256. Not sure what\'s up with that.');
	});
	
	controller.hears(['hex me'],'direct_mention,mention',function(bot, message) {
		bot.startConversation(message,function(err, convo) {
			convo.ask('Please confirm: you are *absolutely* sure you want to be hexed',[
				{
					pattern: bot.utterances.yes,
					callback: function(response, convo) {
						if (hexme.indexOf(response.user) > -1) {
							convo.say('YOU HAVE BEEN HEXED :hackerman: :' + logoEmoji + ':');
							convo.next();
							setTimeout(function() {
								process.exit();
							}, 3000);
						} else {
							convo.say("NU HEXING ALLOWED SORRY");
							convo.next();
						}
					}
				},
				{
					pattern: bot.utterances.no,
					default: true,
					callback: function(response, convo) {
						convo.say('*Okay then, no hexing for today...*');
						convo.next();
					}
				}
			]);
		});
	});

	controller.hears([':simple_smile:'],'ambient',function(bot, message) {
		bot.reply(message, ':simple_smile:');
	});
	
	controller.hears(["Who is the saddest, most depressing creature in the world? ...Like this guy just makes people sad by showing his face..."], "ambient", function(bot, message) {
		bot.reply(message, "Ignore slackbot. It's obviously @c20et.")	
	});

	controller.hears(['users'],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, 'Loading, please wait...');
		phIntApi("users.php", function(resp) {
			bot.reply(message, "Here are the 5 newest users, from newest to oldest:");
			var users = resp.split(",");
			for (var userIndex in users) {
				var user = users[userIndex];
				if (user == "") {
					continue;
				}
				var name = user.split("|")[0];
				var username = user.split("|")[1];
				bot.reply(message, "• " + name + " (" + username + ")");
			}
		});
	});

	controller.hears(['uptime'],'direct_message,direct_mention,mention',function(bot, message) {
		var hostname = os.hostname();
		var uptime = formatUptime(process.uptime());

		bot.reply(message,':robot_face: I have been running for ' + uptime + ' on ' + hostname + '. That\'s a long time. I need a break...');
	});

	controller.hears(['help'],'direct_message,direct_mention,mention',function(bot, message) {
		bot.reply(message, "I don't really do much as of now. I hope to do more things in the future! Tell <@thatoddmailbox> if you have any suggestions.");
	});

	controller.hears(["I didn't get that.", "I don't understand.", "scheduling robot", "not sure what you mean.", 'That does not compute'],'ambient',function(bot, message) {
		if (message.user == meekan_user && message.channel == annoyingness_channel) {
			bot.reply(message, "Well, maybe be less of a _Meekan_, and more of a *PlanBot*. :" + logoEmoji + ':');
		}
	});

	controller.hears(["\\.\\.\\."],'ambient',function(bot, message) {
		if (message.channel == dotdotdot_channel) {
			bot.reply(message, "...");
		}
	});

	controller.hears(["slackbot"],'ambient',function(bot, message) {
		if (message.channel == annoyingness_channel) {
			bot.reply(message, "Oh, that's not me!");
		}
	});

	controller.hears(['shutdown', "goodnight", "good night"],'direct_message,direct_mention,mention',function(bot, message) {
		bot.startConversation(message,function(err, convo) {
			convo.ask('Are you sure you want me to shutdown?',[
				{
					pattern: bot.utterances.yes,
					callback: function(response, convo) {
						if (owners.indexOf(response.user) > -1) {
							convo.say('Bye! :cry:');
							convo.next();
							setTimeout(function() {
								process.exit();
							}, 3000);
						} else {
							convo.say("Hey, wait a minute! You're not allowed to do that—only <@thatoddmailbox> can shut me down!");
							convo.next();
						}
					}
				},
				{
					pattern: bot.utterances.no,
					default: true,
					callback: function(response, convo) {
						convo.say('*Phew!*');
						convo.next();
					}
				}
			]);
		});
	});
	
	controller.hears(['chats'],'direct_mention,mention',function(bot, message) {
		if (message.channel == chat_channel) {
			bot.reply(message, "Go to <https://dashboard.tawk.to|Tawk> for chats!");
		}
	});
});

function formatUptime(uptime) {
	var unit = 'second';
	if (uptime > 60) {
		uptime = uptime / 60;
		unit = 'minute';
	}
	if (uptime > 60) {
		uptime = uptime / 60;
		unit = 'hour';
	}
	if (uptime != 1) {
		unit = unit + 's';
	}

	uptime = uptime + ' ' + unit;
	return uptime;
}

function getVar(name) {
	if (process.env[name]) {
		return process.env[name];
	}
	return undefined;
}

// calls the super secret planhub internal api that may or may not exist
function phIntApi(page, callback) {
	request.post({
		url: 'http://aserv-cloud.cloudapp.net/phapi/' + page,
		form: { token: phIntToken }
	}, function(err, httpResponse, body){
		callback(body);
	});
}
