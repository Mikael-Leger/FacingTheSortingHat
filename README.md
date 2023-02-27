# FacingTheSortingHat

## Node version
<pre>
node v18.12.1
npm 9.1.2
</pre>

## Installation
### Clone
```git clone https://github.com/Mikael-Leger/FacingTheSortingHat.git```
### Install dependencies
```npm i```

## Execution
### Run
```npm run dev```
### Browse
http://localhost:3000/

## Contribute
### Structure
<pre>
|__src
   |__components
      |__chatbox
         |__chatbox.js
         |__chatbox.html
         |__chatbox.css
   |__questions
      |__sorting_hat_full.json
</pre>

### Functions
chatbox.js\
```sendAnswerWithCallback()``` => Clear answers of last message and applies callback (title: string, eraseAnswers: boolean, callback: function)\
```startQuiz()``` => Send a message and start with first question\
```askAgain()``` => Loop so you have to start the quiz\
```sendQuestion()``` => Send next question as a message\
```nextQuestion()``` => Check if quiz is ended and update progression\
```submitAnswer()``` => Submit answer when user click or type any answer (answer: object)\
```chooseHouse()``` => Choose house based on scores gained during the quiz\
```restartQuiz()``` => Restart variables for the quiz\
```closeChatbox()``` => Close the chatbox\
```openChatbox()``` => Open the chatbox\
```eraseMessageText()``` => Erase content in fieldtext\
```sendStartMessage()``` => Send the start message\
```sendRestartMessage()``` => Send the restart message\
```sendMessage()``` => Get user message and deal with it\
```sendName()``` => Save name from last message and start quiz (message: string)\
```pushMessage()``` => Add a message in the conversation (content: string, bot: boolean, options: list)\
