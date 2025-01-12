function display(viewId) {
	document
		.querySelectorAll(".content-div")
		.forEach((view) => view.classList.add("d-none"));
	document.getElementById(viewId).classList.remove("d-none");
}