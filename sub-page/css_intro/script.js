$(document).ready(function() {
	$(".demo-link").click(function() {
		$(".abstract").css("display", "none");
		$(".example-container").css("display", "none");
		// $(".try-container").css("display", "none");
		let index = $(".demo-link").index(this);  // 这是不同级元素获取顺序的办法，若为同级元素，则用$(this).index获取
		// console.log(index);
		$(".abstract")[index].style.display = "block";
		$(".example-container")[index].style.display = "flex";
		// $(".try-container")[index].style.display = "flex";
	})
})