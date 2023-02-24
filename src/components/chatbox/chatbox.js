import questionsJson from '../../questions/sorting_hat.json';

import SvgIcon from '@jamescoyle/vue-icon'
import { mdiWindowClose } from '@mdi/js'

export default {
  name: 'chatbox',
  components: {
    SvgIcon
  },
  props: [],
  data () {
    return {
      pathCloseIcon: mdiWindowClose,
      display: true,
      messages: [
        {
          sender: 'Bot',
          date: '07:02pm',
          content: 'Hi! I am the Sorting Hat. I will show you which house you will be in.'
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
            action: (title) => this.sendAnswerWithCallback(title, this.startQuiz),
          },
          {
            title: 'No',
            action: (title) => this.sendAnswerWithCallback(title, this.askAgain),
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
    this.messages.push(this.messageStart);
  },
  methods: {
    sendAnswerWithCallback(title, callback) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage.goal !== 'startQuiz') {
        lastMessage.answers = [];
      }
      const message = {
        sender: 'User',
        date: '07:09pm',
        content: title,
      }
      this.messages.push(message);
      callback();
    },
    startQuiz() {
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
      this.messages.push(this.messageStart);
    },
    sendQuestion() {
      if (this.questionIndex !== this.questions.length) {
        const question = this.questions[this.questionIndex];
        const message = {
          sender: 'Bot',
          date: '07:11pm',
          content: question.title,
          answers: question.answers,
        }
        this.messages.push(message);
        this.questionIndex++;
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
        this.sendAnswerWithCallback(answer.title, this.sendQuestion);
      }
    },
    chooseHouse() {
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
      const message2 = {
        sender: 'Bot',
        date: '07:16pm',
        content: `Not satisfied? You can still restart the quiz.`,
        answers: [
          {
            title: 'Restart',
            action: (title) => this.sendAnswerWithCallback(title, this.restartQuiz),
          },
          {
            title: 'Close',
            action: () => this.display = false,
          }
        ]
      }
      this.messages.push(message2);
    },
    restartQuiz() {
      console.log(questionsJson);
      this.questionIndex = 0;
      this.startQuiz();
    },
    closeChatbox() {
      this.display = false;
    },
    openChatbox() {
      this.display = true;
    }
  }
}


