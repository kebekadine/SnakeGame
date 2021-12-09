window.onload = function(){
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var xCoord = 0;
    var yCoord = 0;
    var snakee;
    var applee; 
    var widthInBlocks = canvasWidth/blockSize;
    var heightInBlocks = canvasHeight/blockSize;
    var score;
    var timeOut;
    
    init();
    
    function init(){
        var canvas = document.createElement('canvas');
        canvas.setAttribute("id", "game");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid #5466CC";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        //corps du serpent qui avance à droite
        snakee = new Snake([[6,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        refreshCanvas();
    }
    
    // succession affichage de canvas
    function refreshCanvas(){
        snakee.advance();

        //si serpent effectue une collision
        if (snakee.checkCollision()){
            gameOver();
        } else {

            //si serpent mange une pomme
            if (snakee.isEatingApple(applee)){
                score++;
                snakee.ateApple = true;
                
            // nouvelle position tant que la position de la pomme est sur le serpent
                do {
                    applee.setNewPosition(); 
                } while(applee.isOnSnake(snakee));
                
                // si score modulo egal 0 accélére le serpent avec la fonction speedUp
                if(score % 5 == 0){
                    speedUp();
                }
            }

            ctx.clearRect(0,0,canvasWidth,canvasHeight);
            //affichage score
            drawScore();
            //affichage serpent
            snakee.draw();
            //affichage pomme
            applee.draw();
            // refresh avec un time out 
            timeOut = setTimeout(refreshCanvas,delay);
         }
    }
    
    //accélére le jeu

    function speedUp(){
        delay /= 2;
    }


    // affichage du message Game over 
    function gameOver(){
        ctx.save();
        
        var affichage = document.getElementById('myNav').style.height = "100%";
        /*setTimeout(function(){
            var test = document.getElementById('myNav').style.display="none";
            

        }, 2000)*/

        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";

        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }
    
    //fonction pour rejoué une nouvelle partie
    function restart(){
        snakee = new Snake([[6,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        clearTimeout(timeOut);
        delay = 100;
        refreshCanvas();
    }

    //affichage du score avec sa position dans le canvas
    function drawScore(){
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }
    
    //fonction de création d'un  block
    function drawBlock(ctx, position){
        var x = position[0]*blockSize;
        var y = position[1]*blockSize;
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    

    // fonction de contruction du serpent avec sa direction
    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        
        //dessin du serpent sur le canevas
        this.draw = function(){
            ctx.save();
            ctx.fillStyle="#E59363";
            for (var i=0 ; i < this.body.length ; i++){
                drawBlock(ctx,this.body[i]);
            }
            ctx.restore();
        };
        
        //Changé le corps du serpent en fonction de sa direction
        this.advance = function(){
            var nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }
            this.body.unshift(nextPosition);
            //si le serpent mange une pomme sa longueur augmente
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        
        // vérifie si direction permise 
        this.setDirection = function(newDirection){
            var allowedDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left","right"];
                    break;  
               default:
                    throw("invalid direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        
        //vérifie si y a collision 
        //par exemple s'il touche son propre corp collision et s'il touche aussi le bord du canevas collision aussi
        this.checkCollision = function(){
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
                wallCollision = true;
            
            for (var i=0 ; i<rest.length ; i++){
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            
            return wallCollision || snakeCollision;        
        };
        
        // vérifie si la du serpent a mangé un pomme
        this.isEatingApple = function(appleToEat){
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
        
    }



    //fonction pomme
    function Apple(position){
        this.position = position;
        
        //construction du pomme dans le canevas avec sa couleur vert
        this.draw = function(){
          ctx.save();
          ctx.fillStyle = " #7971D3";
          ctx.beginPath();
          var radius = blockSize/2;
          var x = this.position[0]*blockSize + radius;
          var y = this.position[1]*blockSize + radius;
          ctx.arc(x, y, radius, 0, Math.PI*2, true);
          ctx.fill();
          ctx.restore();
        };
        
        this.setNewPosition = function(){
            var newX = Math.round(Math.random()*(widthInBlocks-1));
            var newY = Math.round(Math.random()*(heightInBlocks-1));
            this.position = [newX,newY];
        }; 
        
        this.isOnSnake = function(snakeToCheck){
            var isOnSnake = false;
            for (var i=0 ; i < snakeToCheck.body.length ; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;     
                }
            }
            return isOnSnake;
        };

    }
    
    //gestion direction clavier
    document.onkeydown = function handleKeyDown(e){
        var key = e.keyCode;
        var newDirection;
        switch(key){
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                //restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
}

