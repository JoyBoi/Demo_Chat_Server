function formatMessage(sender, content) {
    return {
        sender,
        content,
        time: Date.now(),
    };
}

module.exports = formatMessage;