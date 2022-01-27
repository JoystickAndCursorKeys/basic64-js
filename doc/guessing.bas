10 rem - this number guessing game is based on guess and hi-lo
20 rem - from david h. ahl's book basic computer games.
30 print "======="
40 print " zero!"
50 print "=======":print
60 print "i choose a number between 1 and 100.":print
70 print "you must zero in on it in 7 guesses.":print
80 print "i tell you to guess higher, or lower.":print
90 input "press enter to start. ready"; start$
100 num = int(100*rnd(1))
110 print:print "====================":print
120 print "i have chosen a number "
130 for count = 1 to 7
140 print "guess ";count;
150 input ": "; guess$
160 guess = val(guess$)
170 if guess = num goto 250
180 if guess > num then print "guess lower"
190 if guess < num then print "guess higher"
200 print
210 next count
220 print:print "you've used all of your guesses."
230 print "the number was";num
240 goto 270
250 print "you got it in ";count;
260 print " guesses."
270 print
280 input "play again? (y/n) "; a$
290 if a$ = "y" then goto 100
300 end
