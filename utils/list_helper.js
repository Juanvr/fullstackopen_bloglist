
const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce( (sum, item) => sum + item.likes, 0);
};

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return {};
    return blogs.reduce( ( max, item) => max.likes < item.likes? item:max, blogs[0]);
};


const mostBlogs = (blogs) => {
    const authors = {};
    blogs.forEach(blog => authors[blog.author] = authors[blog.author]? authors[blog.author] + 1 : 1);

    let mostBlogsAuthor = {};
    for (const author in authors){
        if (mostBlogsAuthor['author']){
            if ( authors[author] > mostBlogsAuthor['blogs']){
                mostBlogsAuthor = {
                    'author': author,
                    'blogs': authors[author]
                };
            }
        }else {
            mostBlogsAuthor = {
                'author': author,
                'blogs': authors[author]
            };
        }
    }
    return mostBlogsAuthor;
};

const mostLikes = (blogs) => {
    const authors = {};
    blogs.forEach(blog => authors[blog.author] = authors[blog.author]? authors[blog.author] + blog.likes : blog.likes);

    let mostLikesAuthor = {};
    for (const author in authors){
        if (mostLikesAuthor['author']){
            if ( authors[author] > mostLikesAuthor['likes']){
                mostLikesAuthor = {
                    'author': author,
                    'likes': authors[author]
                };
            }
        }else {
            mostLikesAuthor = {
                'author': author,
                'likes': authors[author]
            };
        }
    }
    return mostLikesAuthor;
};
module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
};