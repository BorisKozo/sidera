﻿(function() {
    'use strict';

    var Entity = sidera.entities.Entity;
    var fullCircle = sidera.math.geometry.fullCircle;

    var Cursor = sidera.framework.class.derive(Entity, function(camera) {
        Entity.prototype.constructor.call(this, 'Cursor');
        this.camera = camera;
    }, {
        _entity: null,
        mode: 'nothing',
        overValidPlacement: true,
        worldSpace: {
            x: -1,
            y: -1
        },

        render: function(ctx, camera) {
            var e = this._entity;

            if(!e) {
                return;
            }

            var scale = camera.scale;
            var cellSize = sidera.entities.MapGrid.cellSize * scale;
            var offset = cellSize / 2;

            // center on the cell in focus
            var coords = camera.project(this.worldSpace);
            ctx.save();
            ctx.translate(coords.x, coords.y);

            // render red highlight if the placement is invalid
            if(!this.overValidPlacement) {
                ctx.beginPath()
                ctx.rect(-offset, -offset, cellSize, cellSize);
                ctx.fillStyle = 'rgba(255,0,0,0.3)';
                ctx.fill();
            }

            // render the range of the entity (if applicable)
            if(e.range && this.overValidPlacement) {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.arc(0, 0, e.range * cellSize, 0, fullCircle, false);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fill();
            }

            // render the actual sprite of the entity
            ctx.globalAlpha = 0.3
            ctx.drawImage(e.sprites, -offset, -offset, cellSize, cellSize);

            ctx.restore();
        },

        update: function(elapsed, gameObjects) {

            var mouse = sidera.mouse.getState();

            if(!this._entity) return;

            this.worldSpace = this.camera.toWorldSpace(mouse);
            this.worldSpace.x = Math.round(this.worldSpace.x);
            this.worldSpace.y = Math.round(this.worldSpace.y);

            this._entity.x = this.x = this.worldSpace.x;
            this._entity.y = this.y = this.worldSpace.y;

            var blockers = gameObjects.friendlies.concat(gameObjects.enviroment);
            this.overValidPlacement = this.canPlace(blockers);
        },

        setContext: function(type) {
            if(!type) return;

            this.context = type;
            this._entity = new type();
            this.mode = this._entity.type;

            this.find = (this._entity.find) ? this._entity.find.bind(this._entity) : function() {};
        },

        click: function(coords, level, gameObjects) {

            if(!this.context.cost) throw new Error('no cost for context: ' + this.context);

            if(level.money < this.context.cost) return;

            level.money -= this.context.cost;

            var entity = new this.context();

            entity.hydrate({
                x: coords.x,
                y: coords.y,
                onmining: function(take) {
                    level.money += take;
                }
            });

            return entity;
        }
    });

    sidera.framework.namespace.define('sidera', {
        Cursor: Cursor
    });
}());