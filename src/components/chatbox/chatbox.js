import { isProxy, toRaw } from 'vue';
import questionsJson from '../../questions/sorting_hat.json';
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWindowClose, mdiSend } from '@mdi/js'

export default {
  name: 'chatbox',
  components: {
    SvgIcon
  },
  props: [],
  data () {
    return {
      messageText: null,
      username: 'You',
      pathCloseIcon: mdiWindowClose,
      pathSendIcon: mdiSend,
      display: true,
      quizStarted: false,
      quizEnded: false,
      messages: [
        {
          sender: 'Bot',
          date: '07:02pm',
          content: 'Hi! I am the Sorting Hat. I will show you which house you will be in. Could you tell me your name? :)'
        },
      ],
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
  computed: {

  },
  mounted () {
    // this.messages.push(this.messageStart);
  },
  methods: {
    sendAnswerWithCallback(title, eraseAnswers, callback) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (eraseAnswers) {
        lastMessage.answers = [];
      }
      const message = {
        sender: this.username,
        date: '07:09pm',
        content: title,
      }
      this.messages.push(message);
      if (callback) {
        callback();
      }
    },
    startQuiz() {
      this.quizStarted = true;
      this.quizEnded = false;
      const message = {
        sender: 'Bot',
        date: '07:10pm',
        content: 'Quiz is starting!',
      }
      this.messages.push(message);
      this.sendQuestion();
    },
    askAgain() {
      const message = {
        sender: 'Bot',
        date: '07:10pm',
        content: 'Why are you here then? :(',
      }
      this.messages.push(message);
      const messageStart = { ...this.messageStart };
      this.messages.push(messageStart);
    },
    sendQuestion() {
      const question = this.questions[this.questionIndex];
      const message = {
        sender: 'Bot',
        date: '07:11pm',
        content: question.title,
        answers: question.answers,
      }
      this.messages.push(message);
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
    chooseHouse() {
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
      this.messages.push(message);
      const messageRestart = { ...this.messageRestart };
      this.messages.push(messageRestart);
    },
    restartQuiz() {
      this.quizStarted = false;
      this.questionIndex = 0;
      this.startQuiz();
    },
    closeChatbox() {
      this.display = false;
    },
    openChatbox() {
      this.display = true;
    },
    eraseMessageText() {
      this.messageText = '';
    },
    sendMessage() {
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
            this.messages.push(message);
            const messageStart = { ...this.messageStart };
            this.messages.push(messageStart);
          }
        }
      } else if (!this.quizEnded) {
        if (isProxy(this.questions)){
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
            this.messages.push(message);
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
          this.messages.push(message);
          const messageRestart = { ...this.messageRestart };
          this.messages.push(messageRestart);
        }
      }
      this.eraseMessageText();
    },
    sendName() {
      this.username = this.messageText;
      const messageStart = { ...this.messageStart };
      this.messages.push(messageStart);
    }
  }
}


