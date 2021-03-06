define(['mouse', 'keyboard', 'game'], function(mouse, keyboard, game) {

    var hue = 0;
    var direction = 1;
    var transitioning = false;

    var mouseLastFrame = false,
        keyLastFrame = false;

    function start() {
        transitioning = false;
    }

    function centerText(ctx, text, y) {
        var measurement = ctx.measureText(text);
        var x = (ctx.canvas.width - measurement.width) / 2;
        ctx.fillText(text, x, y);
    }

    function draw(ctx, elapsed) {
        var y = ctx.canvas.height / 2;
        var color = 'rgb(' + hue + ',0,0)';
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '48px monospace';
        centerText(ctx, 'sidera', y);

        ctx.fillStyle = color;
        ctx.font = '24px monospace';
        centerText(ctx, 'tap to begin', y + 30);
    }

    function update() {
        hue += 1 * direction;
        if(hue > 255) direction = -1;
        if(hue < 1) direction = 1;

        var mouseState = mouse.getState();
        var anyKeyPressed = keyboard.isAnyKeyPressed();

        var mouseJustReleased = !mouseState.buttonPressed && mouseLastFrame;
        var keyJustReleased = !anyKeyPressed && keyLastFrame;

        if(mouseJustReleased || keyJustReleased && !transitioning) {
            transitioning = true;
            this.transition(game, {
                level: 1
            });
        }

        mouseLastFrame = mouseState.buttonPressed;
        keyLastFrame = anyKeyPressed;
    }

    return {
        start: start,
        draw: draw,
        update: update
    };

});