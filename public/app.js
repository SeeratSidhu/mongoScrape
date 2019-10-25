
function displayNews(data) {
    for (var i = 0; i < data.length; i++) {
        var card = `
            <div class="card">
                <h5 class="card-header"><a href = "${data[i].link}" target = "_blank">${data[i].title}</a></h5>
                <div class="card-body">
                    <p class="card-text">${data[i].body}</p>
                    <a href="#" class="btn btn-primary" class="comment">Leave a Comment</a>
                </div>
            </div>`;
        $("#newsCard").append(card);

    };
};

$("#scrapeButton").on("click", function () {
    $("#newsCard").html("");
    console.log("running");
    $.getJSON("/articles", function (data) {
        console.log(data);
        displayNews(data);
    });
});

$