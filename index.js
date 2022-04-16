const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");
const app = express();
const PORT = 6001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.get("/", function (req, res) {
  res.send("TH Backend Test");
});
function groupBy(arr, key) {
  return arr.reduce(function(prev, current) {
    (prev[current[key]] = prev[current[key]] || []).push(current);
    return prev;
  }, {});
};
app.get("/top-post", async (req, res) => {
  const urls = [
     "https://jsonplaceholder.typicode.com/comments",
     "https://jsonplaceholder.typicode.com/posts"
  ]
  const [comments, posts] = await Promise.all(
    urls.map(url => axios.get(url))
  ).then(results => results.map(res => res.data)).catch(() => {
    return [];
  })
  if(comments?.length || posts?.length) {
    const groupedComments = groupBy(comments, "postId");
    const responsePosts = posts.map((post) => {
      const total_number_of_comments = (groupedComments[`${post.id}`] || []).length;
      return {
        post_id: post.id,
        post_title: post.title,
        post_body: post.body,
        total_number_of_comments
      }
    }).sort((a, b) => a.total_number_of_comments - b.total_number_of_comments)
    res.json(responsePosts);
  }
});

app.get("/comments", async (req, res) => {
  const comments = await axios.get("https://jsonplaceholder.typicode.com/comments").then(result => result.data).catch(() => []);
  res.json(comments.filter((comment) => {
    const query = req.query;
    for(q in query) {
      if(query[q]?.length > 0) {
        if(q === "body") {
          const matcher = new RegExp(query[q]);
          if(!matcher.test(comment[q])) {
            return false;
          };
        }else {
          if(`${comment[q]}` !== query[q]) {
            return false;
          }
        }
      }
    }
    return true;
  }));
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

