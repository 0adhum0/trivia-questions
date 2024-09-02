document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("getQuestionBtn")
		.addEventListener("click", getTriviaQuestion);

	function getTriviaQuestion() {
		// Request questions from the 'society_and_culture' category
		const apiUrl =
			"https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&category=24";

		fetch(apiUrl)
			.then((response) => {
				if (response.status === 429) {
					throw new Error(
						"Too many requests. Please wait a moment and try again."
					);
				} else if (!response.ok) {
					throw new Error(
						"An error occurred while fetching trivia questions."
					);
				}
				return response.json();
			})
			.then((data) => {
				const questionContainer =
					document.getElementById("questionContainer");
				questionContainer.innerHTML = "";

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

				translateText(result.question, "de", (translatedQuestion) => {
					questionElement.innerHTML = translatedQuestion;

					if (result.type === "multiple") {
						const answers = [
							...result.incorrect_answers,
							result.correct_answer,
						];
						shuffleArray(answers);

						answers.forEach((answer) => {
							translateText(answer, "de", (translatedAnswer) => {
								const answerElement =
									document.createElement("p");
								answerElement.classList.add("answer");
								answerElement.innerHTML = translatedAnswer;
								answerElement.onclick = function () {
									if (
										answerElement.style.pointerEvents ===
										"none"
									)
										return;

									answerElement.style.pointerEvents = "none"; // Disable after click

									if (answer === result.correct_answer) {
										this.style.color = "green";
										this.innerHTML += " (Correct)";
									} else {
										this.style.color = "red";
										translateText(
											result.correct_answer,
											"de",
											(translatedCorrectAnswer) => {
												this.innerHTML += ` (Incorrect). The correct answer is: ${translatedCorrectAnswer}`;
											}
										);
									}

									document
										.querySelectorAll(".answer")
										.forEach((element) => {
											element.onclick = null;
										});
								};
								questionItem.appendChild(answerElement);
							});
						});
					} else if (result.type === "boolean") {
						// Handle True/False Questions
					}
				});

				questionContainer.appendChild(questionItem);
			})
			.catch((error) => {
				console.error("Error fetching trivia question:", error);
				document.getElementById("questionContainer").innerHTML =
					error.message;
			});
	}

	function translateText(text, targetLanguage, callback) {
		const translateApiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
			text
		)}&langpair=en|${targetLanguage}`;

		fetch(translateApiUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						"An error occurred while translating the text."
					);
				}
				return response.json();
			})
			.then((data) => {
				const translatedText = data.responseData.translatedText;
				callback(translatedText);
			})
			.catch((error) => {
				console.error("Error translating text:", error);
				callback(text); // Fallback to original text if translation fails
			});
	}

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
});
