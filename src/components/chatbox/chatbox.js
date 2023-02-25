import { isProxy, toRaw, ref } from 'vue';
import questionsJson from '../../questions/sorting_hat_full.json';
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
    const showBox = ref(false);
    const showClosedBox = ref(true);
    const messages = ref([]);
    const messagesSaved = ref([]);
    const window = ref({
      width: 0,
      height: 0
    });

    return { showBox, showClosedBox, messages, messagesSaved, window };
  },
  props: [],
  data () {
    return {
      messageText: null,
      username: 'You',
      pathCloseIcon: mdiWindowRestore,
      pathOpenIcon: mdiWindowMinimize,
      pathSendIcon: mdiSend,
      quizStarted: false,
      quizEnded: false,
      questions: questionsJson.sort((a, b) => 0.5 - Math.random()),
      progression: 0,
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
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.pushMessage('Hi! I am the Sorting Hat. I will show you which house you will be in. Could you tell me your name? :)', true);
    this.showBox = !this.showBox;
    this.showClosedBox = !this.showClosedBox;
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
      if (isProxy(this.questions)) {
        const questions = toRaw(this.questions)
        const question = questions[this.questionIndex];
        const options = [
          {
            key: 'answers',
            value: question.answers
          },
          {
            key: 'answersAreLong',
            value: (question.answers[0].title.length >= 20) || (question.answers.length >= 5)
          }
        ]
        await this.pushMessage(question.title, true, options);
      }
    },
    nextQuestion() {
      if (this.questionIndex !== this.questions.length - 1) {
        this.questionIndex++;
        this.progression = Math.round((this.questionIndex * 100) / this.questions.length);
        this.sendQuestion();
      } else {
        this.chooseHouse();
      }
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
      await this.pushMessage(`${houseName}! I have chosen wisely!`, true);
      await this.sendRestartMessage();
    },
    restartQuiz() {
      this.quizStarted = false;
      this.questionIndex = 0;
      this.startQuiz();
    },
    async closeChatbox() {
      if (this.window.width < 850) {
        return;
      }
      this.messagesSaved = [ ...this.messages ];
      await Promise.resolve(this.messages = []);
      this.showBox = !this.showBox;
      await new Promise(r => setTimeout(r, 1510));
      this.showClosedBox = !this.showClosedBox;
    },
    async openChatbox() {
      this.showClosedBox = !this.showClosedBox;
      await Promise.resolve(this.showBox = !this.showBox);
      this.messages = [ ...this.messagesSaved ];
      this.messagesSaved = [];
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
      if (!this.quizStarted && this.questionIndex === 0) {
        if (this.username === 'You') {
          this.sendAnswerWithCallback(this.messageText, true);
          this.sendName();
        } else {
          this.sendAnswerWithCallback(this.messageText, true);
          if (this.messageText.toLowerCase() === 'yes') {
            this.startQuiz();
          } else if (this.messageText.toLowerCase() === 'no') {
            this.askAgain();
          } else {
            await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
            await this.sendStartMessage();
          }
        }
      } else if (!this.quizEnded) {
        if (isProxy(this.questions)) {
          const questions = toRaw(this.questions)
          const question = questions[this.questionIndex];
          const { answers } = question;
          const answerFound = answers.find(e => this.messageText.toLowerCase().includes(e.title.toLowerCase()));
          if (answerFound) {
            this.submitAnswer(answerFound);
          } else {
            this.sendAnswerWithCallback(this.messageText, false);
            await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
            this.sendQuestion();
          }
        }
      } else {
        this.sendAnswerWithCallback(this.messageText, true);
        if (this.messageText.toLowerCase() === 'restart') {
          this.restartQuiz();
        } else {
          await this.pushMessage(`Sorry ${this.username}, I did not understand your choice.`, true);
          await this.sendRestartMessage();
        }
      }
      this.eraseMessageText();
    },
    async sendName() {
      this.username = this.messageText;
      await this.pushMessage(`Nice to meet you ${this.username}!`, true);
      await this.sendStartMessage();
    },
    async pushMessage(content, bot, options = []) {
      if (bot) {
        await new Promise(r => setTimeout(r, 1200));
      }
      const lastMessage = this.messages[this.messages.length - 1];
      const dateNow = new Date();
      const dateFormatted =
        `${dateNow.getHours() < 10 ? '0' : ''}${dateNow.getHours()}:${dateNow.getMinutes() < 10 ? '0' : ''}${dateNow.getMinutes()}`;
      const messageWithId = { 
        id: (lastMessage) ? lastMessage.id + 1 : 0,
        sender: bot ? 'Bot' : this.username,
        content,
        date: dateFormatted,
      };
      options.forEach(option => {
        messageWithId[option.key] = option.value;
      });
      await this.messages.push(messageWithId);
      this.scrollToBottom();
    },
    async scrollToBottom() {
      if (isProxy(this.$refs)) {
        const refs = toRaw(this.$refs)
        await new Promise(r => setTimeout(r, 1510));
        const ref = refs[`bottom${Object.keys(refs).length - 1}`][0];
        ref.scrollIntoView(true);
        // ref.scrollIntoView({ behavior: "smooth" }); // Smooth not working because of weird perfect scroll element
      }
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    }
  }
}