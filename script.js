// Initialize quiz state
let questions = [];
let current = 0;
let score = 0;
let selectedSubject = "";
let timerInterval = null;
let remainingTime = 1800; // 150 minutes = 150 * 60 = 9000 seconds

// Cache DOM elements
const quizEl = document.getElementById("quiz");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");
const subjectSelector = document.getElementById("subjectSelector");
const timerEl = document.getElementById("timer");

// Mapping subject names to global arrays from subject files
const subjects = {
  math: window.mathQuestions || [],
  science: window.scienceQuestions || [],
  social_science: window.socialScienceQuestions || [],
  bengali: window.bengaliQuestions || [],
  english: window.englishQuestions || [],
};

// Listen for subject selection changes
subjectSelector.addEventListener("change", () => {
  const selectedSubjectValue = subjectSelector.value;
  if (!selectedSubjectValue) {
    resetQuizDisplay();
    clearInterval(timerInterval);
    timerEl.textContent = "Time Remaining: 30:00";
    return;
  }
  selectedSubject = selectedSubjectValue;
  remainingTime = 30 * 60; // reset timer
  startTimer();
  loadSubject(selectedSubjectValue);
});

// Start countdown timer
function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = "Time's up!";
      endQuizDueToTimeout();
    }
  }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerEl.textContent = `Time Remaining: ${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// End the quiz due to timeout and show final result
function endQuizDueToTimeout() {
  quizEl.style.display = "none";
  resultEl.style.display = "block";
  restartBtn.style.display = "inline-block";

  resultEl.className = "result needs-improvement";
  resultEl.innerHTML = `
    <div class="score-animation">
      <div>Time's up!</div>
      <div>Your quiz has finished.</div>
      <div>Your final score is ${score} out of ${questions.length}</div>
    </div>
  `;
}

// Load questions of selected subject and start quiz
function loadSubject(subject) {
  questions = subjects[subject];
  if (!questions || questions.length === 0) {
    quizEl.innerHTML = "<p>No questions available for this subject.</p>";
    return;
  }

  questions = shuffleArray([...questions]);

  current = 0;
  score = 0;
  resultEl.style.display = "none";
  restartBtn.style.display = "none";
  quizEl.style.display = "block";
  renderQuestion();
}

// Shuffle array function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create progress bar
function createProgressBar() {
  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.id = "progressBar";

  progressContainer.appendChild(progressBar);
  return progressContainer;
}

// Update progress bar
function updateProgress() {
  const progressBar = document.getElementById("progressBar");
  if (progressBar) {
    const percentage = (current / questions.length) * 100;
    progressBar.style.width = percentage + "%";
  }
}

// Render current question and options
function renderQuestion() {
  if (current >= questions.length) {
    showResult();
    return;
  }

  const q = questions[current];
  if (!q) {
    quizEl.innerHTML = "<p>Error: question data not found.</p>";
    return;
  }

  let progressContainer = document.querySelector(".progress-container");
  if (!progressContainer) {
    progressContainer = createProgressBar();
  }

  quizEl.innerHTML = `
    <div class="question-counter">Question ${current + 1} of ${
    questions.length
  }</div>
    <div class="question">${q.question}</div>
    <div class="options">
      ${q.options
        .map((opt) => `<button class="option-btn">${opt}</button>`)
        .join("")}
    </div>
  `;

  const questionCounter = quizEl.querySelector(".question-counter");
  if (questionCounter) {
    const nextEl = questionCounter.nextElementSibling;
    if (!nextEl || !nextEl.classList.contains("progress-container")) {
      questionCounter.insertAdjacentElement("afterend", progressContainer);
    }
  }

  updateProgress();

  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      optionButtons.forEach((b) => (b.disabled = true));
      checkAnswer(btn.textContent, btn, optionButtons);
    });
  });
}

// Compare selected answer and move forward with visual feedback
function checkAnswer(selected, clickedBtn, allButtons) {
  const correctAnswer = questions[current].answer;
  const isCorrect = selected === correctAnswer;

  if (isCorrect) {
    score++;
    clickedBtn.classList.add("correct");
    showFeedback("Correct! 🎉", "success");
  } else {
    clickedBtn.classList.add("incorrect");
    allButtons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
    showFeedback("Incorrect! 😔", "error");
  }

  setTimeout(() => {
    current++;
    renderQuestion();
  }, 1500);
}

// Show feedback message
function showFeedback(message, type) {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    font-weight: 600;
    z-index: 1000;
    animation: feedbackSlide 0.5s ease-out;
    ${
      type === "success"
        ? "background: linear-gradient(145deg, #28a745, #20c997); color: white;"
        : "background: linear-gradient(145deg, #dc3545, #fd7e14); color: white;"
    }
  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 1500);
}

// Show final score and restart button with enhanced styling
function showResult() {
  clearInterval(timerInterval);
  quizEl.style.display = "none";

  const percentage = Math.round((score / questions.length) * 100);
  let resultClass = "needs-improvement";
  let resultMessage = "Keep practicing! 📚";

  if (percentage >= 80) {
    resultClass = "excellent";
    resultMessage = "Excellent work! 🌟";
  } else if (percentage >= 60) {
    resultClass = "good";
    resultMessage = "Good job! 👍";
  }

  resultEl.className = `result ${resultClass}`;
  resultEl.innerHTML = `
    <div class="score-animation">
      <div>Final Score: ${score} / ${questions.length}</div>
      <div>Percentage: ${percentage}%</div>
      <div class="result-message">${resultMessage}</div>
    </div>
  `;

  resultEl.style.display = "block";
  restartBtn.style.display = "inline-block";

  if (percentage >= 80) {
    createConfetti();
  }
}

// Create confetti effect
function createConfetti() {
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#28a745",
    "#ffc107",
  ];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: confettiFall 3s linear forwards;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
}

// Restart quiz for current subject
restartBtn.addEventListener("click", () => {
  if (selectedSubject) {
    remainingTime = 30 * 60;
    startTimer();
    loadSubject(selectedSubject);
  }
});

// Reset display when no subject selected
function resetQuizDisplay() {
  quizEl.innerHTML =
    '<p style="color: #666; font-size: 1.1em;">Please select a subject to start the quiz</p>';
  resultEl.style.display = "none";
  restartBtn.style.display = "none";
  clearInterval(timerInterval);
  timerEl.textContent = "Time Remaining: 30:00";
}

// Add CSS animations dynamically
const style = document.createElement("style");
style.textContent = `
  .question-counter {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  @keyframes feedbackSlide {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  
  .result-message {
    margin-top: 15px;
    font-size: 0.8em;
    opacity: 0.9;
  }
  
  .progress-container {
    width: 100%;
    background-color: #ddd;
    border-radius: 5px;
    margin-bottom: 15px;
    height: 10px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 10px;
    background-color: #28a745;
    width: 0%;
    transition: width 0.3s ease;
  }
`;
document.head.appendChild(style);

// Initialize with welcome message
resetQuizDisplay();
