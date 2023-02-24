import { isProxy, toRaw, ref } from 'vue';
import questionsJson from '../../questions/sorting_hat.json';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWindowRestore, mdiWindowMinimize, mdiSend } from '@mdi/js'

export default {
  name: 'chatbox',
  components: {
    SvgIcon
  },
  setup() {
    const showBox = ref(false);
    const showClosedBox = ref(true);
    const messages = ref([
      {
        id: 0,
        sender: 'Bot',
        date: '07:02pm',
        content: 'Hi! I am the Sorting Hat. I will show you which house you will be in. Could you tell me your name? :)'
      },
    ]);
    const messagesSaved = ref([]);
    
    return { showBox, showClosedBox, messages, messagesSaved };
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
      questions: questionsJson,
      messageStart: {
        sender: 'Bot',
        date: '07:07pm',
        content: 'Are you ready to start?',
        goal: 'startQuiz',
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
        sender: 'Bot',
        date: '07:16pm',
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
    this.showBox = !this.showBox;
    this.showClosedBox = !this.showClosedBox;
    this.startQuiz();
  },
  methods: {
    async sendAnswerWithCallback(title, eraseAnswers, callback) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (eraseAnswers) {
        lastMessage.answers = [];
      }
      const message = {
        sender: this.username,
        date: '07:09pm',
        content: title,
      }
      await this.pushMessage(message);
      if (callback) {
        callback();
      }
    },
    async startQuiz() {
      this.quizStarted = true;
      this.quizEnded = false;
      const message = {
        sender: 'Bot',
        date: '07:10pm',
        content: 'Quiz is starting!',
      }
      await this.pushMessage(message);
      this.sendQuestion();
    },
    async askAgain() {
      const message = {
        sender: 'Bot',
        date: '07:10pm',
        content: 'Why are you here then? :(',
      }
      await this.pushMessage(message);
      const messageStart = { ...this.messageStart };
      await this.pushMessage(messageStart);
    },
    async sendQuestion() {
      if (isProxy(this.questions)) {
        const questions = toRaw(this.questions)
        const question = questions[this.questionIndex];
        const message = {
          sender: 'Bot',
          date: '07:11pm',
          content: question.title,
          answers: question.answers,
          answersAreLong: question.answers[0].title.length >= 20
        }
        await this.pushMessage(message);
      }
    },
    nextQuestion() {
      if (this.questionIndex !== this.questions.length - 1) {
        this.questionIndex++;
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
      const message = {
        sender: 'Bot',
        date: '07:15pm',
        content: `${houseName}! I have chosen wisely!`,
      }
      await this.pushMessage(message);
      const messageRestart = { ...this.messageRestart };
      await this.pushMessage(messageRestart);
    },
    restartQuiz() {
      this.quizStarted = false;
      this.questionIndex = 0;
      this.startQuiz();
    },
    async closeChatbox() {
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
            const message = {
              sender: 'Bot',
              date: '07:24pm',
              content: `Sorry ${this.username}, I did not understand your choice.`,
            }
            await this.pushMessage(message);
            const messageStart = { ...this.messageStart };
            await this.pushMessage(messageStart);
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
            const message = {
              sender: 'Bot',
              date: '07:24pm',
              content: `Sorry ${this.username}, I did not understand your choice.`,
            }
            await this.pushMessage(message);
            this.sendQuestion();
          }
        }
      } else {
        this.sendAnswerWithCallback(this.messageText, true);
        if (this.messageText.toLowerCase() === 'restart') {
          this.restartQuiz();
        } else {
          const message = {
            sender: 'Bot',
            date: '07:24pm',
            content: `Sorry ${this.username}, I did not understand your choice.`,
          }
          await this.pushMessage(message);
          const messageRestart = { ...this.messageRestart };
          await this.pushMessage(messageRestart);
        }
      }
      this.eraseMessageText();
    },
    async sendName() {
      this.username = this.messageText;
      const message = {
        sender: 'Bot',
        date: '07:35pm',
        content: `Nice to meet you ${this.username}!`,
      }
      await this.pushMessage(message);
      const messageStart = { ...this.messageStart };
      await this.pushMessage(messageStart);
    },
    async pushMessage(message) {
      if (message.sender === 'Bot') {
        await new Promise(r => setTimeout(r, 1200));
      }
      const lastMessage = this.messages[this.messages.length - 1];
      const messageWithId = { ...message };
      messageWithId.id = lastMessage.id + 1;
      await this.messages.push(messageWithId);
      this.scrollToBottom();
    },
    async scrollToBottom() {
      if (isProxy(this.$refs)) {
        const refs = toRaw(this.$refs)
        await new Promise(r => setTimeout(r, 1810));
        // Scrolling make top bar padding go crazy =)
        // refs[`bottom${Object.keys(refs).length - 1}`][0].scrollIntoView(true);
        // refs[`bottom${Object.keys(refs).length - 1}`][0].scrollIntoView({ behavior: "smooth" }); // Smooth working but ultra slow, why?
      }
    },
  }
}


