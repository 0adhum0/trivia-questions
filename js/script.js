document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("getQuestionBtn")
		.addEventListener("click", getTriviaQuestion);

	function getTriviaQuestion() {
		// Request questions from the 'society_and_culture' category
		const apiUrl =
			"https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&category=24"; // Adjust category as needed

		fetch(apiUrl)
			.then((response) => {
				if (response.status === 429) {
					// Rate limit error
					throw new Error(
						"Too many requests. Please wait a moment and try again."
					);
				} else if (!response.ok) {
					// Other errors
					throw new Error(
						"An error occurred while fetching trivia questions."
					);
				}
				return response.json();
			})
			.then((data) => {
				const questionContainer =
					document.getElementById("questionContainer");
				questionContainer.innerHTML = ""; // Clear previous question

				if (data.results.length === 0) {
					questionContainer.innerHTML =
						"No questions found. Please try again later.";
					return;
				}

				const result = data.results[0];
				const questionItem = document.createElement("div");
				questionItem.classList.add("question-item");

				const questionElement = document.createElement("p");
				questionElement.innerHTML = result.question;
				questionItem.appendChild(questionElement);

				let attempted = false; // Track if an attempt has been made

				if (result.type === "multiple") {
					// Multiple Choice Question
					const answers = [
						...result.incorrect_answers,
						result.correct_answer,
					];
					shuffleArray(answers); // Randomize the answer order

					answers.forEach((answer) => {
						const answerElement = document.createElement("p");
						answerElement.classList.add("answer");
						answerElement.innerHTML = answer;
						answerElement.onclick = function () {
							if (attempted) return; // Prevent further attempts
							attempted = true; // Mark as attempted

							// Check if clicked answer is correct
							if (answer === result.correct_answer) {
								this.style.color = "green";
								this.innerHTML += " (Correct)";
							} else {
								this.style.color = "red";
								this.innerHTML += ` (Incorrect). The correct answer is: ${result.correct_answer}`;
							}

							// Disable all options after the first attempt
							document
								.querySelectorAll(".answer")
								.forEach((element) => {
									element.onclick = null;
								});
						};
						questionItem.appendChild(answerElement);
					});
				} else if (result.type === "boolean") {
					// True/False Question
					const trueButton = document.createElement("button");
					trueButton.innerHTML = "True";
					trueButton.onclick = function () {
						revealAnswer(true);
					};
					questionItem.appendChild(trueButton);

					const falseButton = document.createElement("button");
					falseButton.innerHTML = "False";
					falseButton.onclick = function () {
						revealAnswer(false);
					};
					questionItem.appendChild(falseButton);

					function revealAnswer(userAnswer) {
						const isCorrect =
							(userAnswer && result.correct_answer === "True") ||
							(!userAnswer && result.correct_answer === "False");
						questionContainer.innerHTML = `The correct answer is: ${
							result.correct_answer
						}.<br> You were ${
							isCorrect ? "correct" : "incorrect"
						}.`;
					}
				} else {
					questionContainer.innerHTML = "Unsupported question type.";
				}

				questionContainer.appendChild(questionItem);
			})
			.catch((error) => {
				console.error("Error fetching trivia question:", error);
				document.getElementById("questionContainer").innerHTML =
					error.message;
			});
	}

	// Utility function to shuffle array elements
	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
});
