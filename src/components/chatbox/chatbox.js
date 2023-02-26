import { ref } from 'vue';
import questionsJson from '../../questions/sorting_hat.json';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWindowRestore, mdiWindowMinimize, mdiSend } from '@mdi/js'
import { MqResponsive } from "vue3-mq";

export default {
  name: 'chatbox',
  components: {
    SvgIcon,
    MqResponsive
  },
  setup() {
    const messageWrapper = ref(null);

    return { messageWrapper };
  },
  props: [],
  data () {
    return {
      showBox: false,
      messageText: null,
      dateTimeFormatter: new Intl.DateTimeFormat("default", { hour: "numeric", minute: "numeric" }),
      username: 'You',
      pathCloseIcon: mdiWindowRestore,
      pathOpenIcon: mdiWindowMinimize,
      pathSendIcon: mdiSend,
      quizStarted: false,
      quizEnded: false,
      questions: questionsJson.sort((a, b) => 0.5 - Math.random()),
      progression: 0,
      messages: [],
      messageStart: {
        content: 'Are you ready to start?',
        answers: [
          {
            title: 'Yes',
            action: (title) => this.sendAnswerWithCallback(title, true, this.startQuiz),
          },
          {
            title: 'No',
            action: (title) => this.sendAnswerWithCallback(title, true, this.askAgain),
          }
        ]
      },
      messageRestart: {
        content: 'Not satisfied? You can still restart the quiz.',
        answers: [
          {
            title: 'Restart',
            action: (title) => this.sendAnswerWithCallback(title, true, this.restartQuiz),
          }
        ]
      },
      scores: {
        g: 0,
        r: 0,
        h: 0,
        s: 0
      },
      questionIndex: 0
    }
  },
  mounted () {
    this.pushMessage('Hi! I am the Sorting Hat. I will show you which house you will be in. Could you tell me your name? :)', true);
    this.showBox = !this.showBox;
    // this.startQuiz();
    // this.startQuiz();
    // this.startQuiz();
  },
  methods: {
    async sendAnswerWithCallback(title, eraseAnswers, callback) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (eraseAnswers) {
        lastMessage.answers = [];
      }
      await this.pushMessage(title, false);
      if (callback) {
        callback();
      }
    },
    async startQuiz() {
      this.quizStarted = true;
      this.quizEnded = false;
      await this.pushMessage('Quiz is starting!', true);
      this.sendQuestion();
    },
    async askAgain() {
      await this.pushMessage('Why are you here then? :(', true);
      await this.sendStartMessage();
    },
    async sendQuestion() {
      const question = this.questions[this.questionIndex];
      const options = [
        {
          key: 'answers',
          value: question.answers
        },
        {
          key: 'answersAreLong',
          value: (question.answers.find(answer => answer.title.length >= 20) !== -1) || (question.answers.length >= 5)
        }
      ]
      await this.pushMessage(question.title, true, options);
    },
    nextQuestion() {
      if (this.questionIndex++ !== this.questions.length - 1) {
        this.sendQuestion();
      } else {
        this.chooseHouse();
      }
      this.progression = Math.round((this.questionIndex * 100) / this.questions.length);
    },
    submitAnswer(answer) {
      if (answer.action) {
        answer.action(answer.title)
      } else {
        this.scores.g += answer.scores.g,
        this.scores.r += answer.scores.r,
        this.scores.h += answer.scores.h,
        this.scores.s += answer.scores.s,
        this.sendAnswerWithCallback(answer.title, true, this.nextQuestion);
      }
    },
    async chooseHouse() {
      this.quizEnded = true;
      let maxScore = {
        value: 0
      };
      for (const [key, value] of Object.entries(this.scores)) {
        if (value > maxScore.value) {
          maxScore = {
            key,
            value
          }
        }
      }
      
      let houseName;
      switch (maxScore.key) {
        case 'g':
          houseName =	'Gryffindor' 
          break;
        case 'r':
          houseName =	'Ravenclaw' 
          break;
        case 'h':
          houseName =	'Hufflepuff' 
          break;
        case 's':
          houseName =	'Slytherin' 
          break;
        default:
          break;
      }
      await this.pushMessage('Then... It will be....', true);
      await this.pushMessage(`${houseName}!`, true);
      await this.sendRestartMessage();
    },
    restartQuiz() {
      this.quizStarted = false;
      this.questionIndex = 0;
      this.progression = 0;
      this.startQuiz();
    },
    async closeChatbox() {
      this.showBox = !this.showBox;
    },
    async openChatbox() {
      this.showBox = !this.showBox;
    },
    eraseMessageText() {
      this.messageText = '';
    },
    async sendStartMessage() {
      const messageStart = { ...this.messageStart };
      const options = [
        {
          key: 'answers',
          value: messageStart.answers
        }
      ]
      await this.pushMessage(messageStart.content, true, options);
    },
    async sendRestartMessage() {
      const messageRestart = { ...this.messageRestart };
      const options = [
        {
          key: 'answers',
          value: messageRestart.answers
        }
      ]
      await this.pushMessage(messageRestart.content, true, options);
    },
    async sendMessage() {
      const message = this.messageText.trim();
      this.eraseMessageText();
      if (!this.quizStarted && this.questionIndex === 0) {
        if (this.username === 'You') {
          this.sendAnswerWithCallback(message, true);
          this.sendName(message);
        } else {
          this.sendAnswerWithCallback(message, true);
          if (message.toLowerCase() === 'yes') {
            this.startQuiz();
          } else if (message.toLowerCase() === 'no') {
            this.askAgain();
          } else {
            await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
            await this.sendStartMessage();
          }
        }
      } else if (!this.quizEnded) {
        const question = this.questions[this.questionIndex];
        const { answers } = question;
        const answerFound = answers.find(e => message.toLowerCase().includes(e.title.toLowerCase()));
        if (answerFound) {
          this.submitAnswer(answerFound);
        } else {
          this.sendAnswerWithCallback(message, false);
          await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
          this.sendQuestion();
        }
      } else {
        this.sendAnswerWithCallback(message, true);
        if (message.toLowerCase() === 'restart') {
          this.restartQuiz();
        } else {
          await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
          await this.sendRestartMessage();
        }
      }
      this.eraseMessageText();
    },
    async sendName(message) {
      this.username = message;
      await this.pushMessage(`Nice to meet you ${this.username}!`, true);
      await this.sendStartMessage();
    },
    async pushMessage(content, bot, options = []) {
      if (bot) {
        await new Promise(r => setTimeout(r, 1200));
      } else {
        await new Promise(r => setTimeout(r, 200));
      }
      const lastMessage = this.messages[this.messages.length - 1];
      const messageWithId = { 
        id: (lastMessage) ? lastMessage.id + 1 : 0,
        sender: bot ? 'Bot' : this.username,
        content,
        date: new Date(),
      };
      options.forEach(option => {
        messageWithId[option.key] = option.value;
      });
      this.messages = [...this.messages, messageWithId];
    },
  },
  watch: {
    messages: {
      handler(messages) {
        messages.length > 0 && this.messageWrapper.lastElementChild.scrollIntoView({ behavior: "smooth" });
      },
      flush: "post"
    }
  },
}