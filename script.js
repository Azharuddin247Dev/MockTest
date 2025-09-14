let userName = "";
let questions = [];
let current = 0;
let score = 0;
let subjectOrder = ["math", "science", "social_science", "bengali", "english"];
let currentSubjectIndex = 0;
let results = [];
let timer; // interval
let remainingTime = 9000; // 150 minutes in seconds

const container = document.querySelector(".quiz-container");

const subjects = {
  math: window.mathQuestions || [],
  science: window.scienceQuestions || [],
  social_science: window.socialScienceQuestions || [],
  bengali: window.bengaliQuestions || [],
  english: window.englishQuestions || [],
};

function showNameInput() {
  container.innerHTML = `
    <h1>WB TET 2025 Mock Test</h1>
    <div id="nameBox">
      <label for="userNameInput">Enter your name:</label><br/>
      <input id="userNameInput" type="text" required autofocus style="padding:8px 12px; font-size:1.1em; border-radius:6px; border:1px solid #ccc;" />
      <button id="startTestBtn" style="margin-left:8px; padding:8px 16px; font-size:1.1em; border:none; border-radius:6px; background:#667eea; color:#fff; cursor:pointer;">Start Test</button>
    </div>
    <div id="timer" style="display:none; font-weight:600; font-size:1.2em; margin-top:20px;"></div>
  `;
  document.getElementById("startTestBtn").onclick = function () {
    let inputValue = document.getElementById("userNameInput").value.trim();
    if (inputValue) {
      userName = inputValue;
      startExam();
    } else {
      alert("Please enter your name.");
    }
  };
}
showNameInput();

function startExam() {
  container.innerHTML = `
    <h2>Hello, ${userName}! Your test will begin now.</h2>
  `;
  setTimeout(() => {
    container.innerHTML = `
      <div id="timer" style="font-weight:600; font-size:1.2em; margin-bottom:15px;"></div>
      <div id="liveScore" style="font-weight:600; font-size:1em; margin-bottom:15px; color:#333;">
        Right: 0 &nbsp;&nbsp; Wrong: 0
      </div>
      <div id="quiz"></div>
      <div id="result" class="result" style="display:none;"></div>
      <button id="restartBtn" style="display:none; margin-top:20px; padding:12px 25px; font-weight:600; font-size:1.1em; border:none; border-radius:8px; background:#667eea; color:#fff; cursor:pointer;">Restart</button>
    `;

    window.quizEl = document.getElementById("quiz");
    window.resultEl = document.getElementById("result");
    window.restartBtn = document.getElementById("restartBtn");
    window.timerEl = document.getElementById("timer");
    window.liveScoreEl = document.getElementById("liveScore");

    currentSubjectIndex = 0;
    results = [];
    score = 0;
    current = 0;
    rightCount = 0;
    wrongCount = 0;
    remainingTime = 9000;

    startTimer();
    loadSubject(subjectOrder[currentSubjectIndex]);

    restartBtn.onclick = () => location.reload();
  }, 2000);
}

let rightCount = 0;
let wrongCount = 0;

function startTimer() {
  updateTimerDisplay();
  timer = setInterval(() => {
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerEl.textContent = `Time left: ${minutes}m ${
    seconds < 10 ? "0" + seconds : seconds
  }s`;
}

function loadSubject(subject) {
  questions = subjects[subject];
  // Handle if questions is undefined or empty gracefully
  if (!questions || questions.length === 0) {
    quizEl.innerHTML = `<p>No questions available for ${subject.toUpperCase()}</p>`;
    // Move to next subject or finish if none left
    currentSubjectIndex++;
    if (currentSubjectIndex < subjectOrder.length) {
      loadSubject(subjectOrder[currentSubjectIndex]);
    } else {
      finishExam();
    }
    return;
  }
  current = 0;
  score = 0;
  rightCount = 0;
  wrongCount = 0;
  updateLiveScore();
  renderQuestion();
}

function updateLiveScore() {
  liveScoreEl.textContent = `Right: ${rightCount}    Wrong: ${wrongCount}`;
}

function renderQuestion() {
  if (current >= questions.length) {
    // Save results for this subject
    results.push({
      subject: subjectOrder[currentSubjectIndex],
      score,
      total: questions.length,
    });
    // Move to next subject
    currentSubjectIndex++;
    if (currentSubjectIndex < subjectOrder.length && remainingTime > 0) {
      loadSubject(subjectOrder[currentSubjectIndex]);
    } else {
      finishExam();
    }
    return;
  }

  const q = questions[current];
  if (!q || !q.question || !q.options || !q.answer) {
    console.error('Invalid question data at index:', current);
    current++;
    renderQuestion();
    return;
  }
  quizEl.innerHTML = `
    <div class="question">${q.question}</div>
    <div id="optionArea" class="options">
      ${q.options
        .map(
          (opt, i) =>
            `<button class="option-btn" data-idx="${i}">${opt}</button>`
        )
        .join("")}
    </div>
    <div id="feedback" style="margin:12px 0; font-size:1.15em; font-weight:bold;"></div>
    <div style="margin:10px 0;font-weight:bold;">
      Subject: ${subjectOrder[currentSubjectIndex]
        .replace("_", " ")
        .toUpperCase()} | Q${current + 1} / ${questions.length}
    </div>
  `;

  const optionBtns = Array.from(document.querySelectorAll(".option-btn"));
  const feedbackEl = document.getElementById("feedback");
  let isAnswered = false;

  optionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isAnswered) return;
      isAnswered = true;
      
      try {
        const correctIndex = q.options.findIndex((opt) => opt === q.answer);
        const selectedIndex = parseInt(btn.getAttribute("data-idx"));

        optionBtns.forEach((b) => (b.disabled = true));

        if (selectedIndex === correctIndex) {
          btn.style.background = "#46B546";
          btn.style.color = "#fff";
          feedbackEl.textContent = "Correct!";
          feedbackEl.style.color = "#46B546";
          score++;
          rightCount++;
        } else {
          btn.style.background = "#e74c3c";
          btn.style.color = "#fff";
          if (optionBtns[correctIndex]) {
            optionBtns[correctIndex].style.background = "#46B546";
            optionBtns[correctIndex].style.color = "#fff";
          }
          feedbackEl.textContent = "Wrong!";
          feedbackEl.style.color = "#e74c3c";
          wrongCount++;
        }

        updateLiveScore();

        setTimeout(() => {
          current++;
          renderQuestion();
        }, 1200);
      } catch (error) {
        console.error('Error in answer processing:', error);
        current++;
        renderQuestion();
      }
    });
  });
}

function finishExam() {
  clearInterval(timer);
  quizEl.style.display = "none";
  timerEl.style.display = "none";
  liveScoreEl.style.display = "none";

  let totalScore = results.reduce((sum, r) => sum + r.score, 0);
  let totalQuestions = results.reduce((sum, r) => sum + r.total, 0);
  const percentage = Math.round((totalScore / totalQuestions) * 100);

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
  resultEl.style.display = "block";
  resultEl.innerHTML = `
    <h2>Exam Complete!</h2>
    <div><strong>Name:</strong> ${userName}</div>
    <div style="margin: 12px 0; font-size:1.2em;">
      <strong>Total Score:</strong> ${totalScore} / ${totalQuestions} (${percentage}%)
    </div>
    <div style="text-align:left; margin-top:15px;">
      ${results
        .map(
          (r) => `
        <div style="margin-bottom: 8px;">
          <strong>${r.subject.replace("_", " ").toUpperCase()}</strong>: ${
            r.score
          } / ${r.total}
        </div>
      `
        )
        .join("")}
    </div>
    <div style="margin-top:20px; color:#2e7d32; font-weight:600;">
      Results saved in your browser.
    </div>
  `;
  saveResults();
  restartBtn.style.display = "inline-block";
  restartBtn.onclick = () => location.reload();
}

function saveResults() {
  const examResult = {
    user: userName,
    date: new Date().toLocaleString(),
    scores: results,
  };
  localStorage.setItem(
    `wbTetExamResult_${userName}`,
    JSON.stringify(examResult)
  );
}
