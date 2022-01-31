0 print "{147}{5}"
1 poke 53281,0: poke 53280,0
2 print tab(10);"tic-tac-toe"
4 print tab(0);"creative computing":print" morristown, new jersey"
5 print: print tab(0);"adapted by cursorkeys, 2022"
6 print:print:print
8 print "the board is numbered:"
10 print " 1  2  3"
12 print " 4  5  6"
14 print " 7  8  9"
16 print:print:print
20 dim s(9)
50 input"do you want 'x' or 'o'";c$
55 if c$="x"then goto 475
60 p$="o":q$="x"
100 g=-1:h=1:if s(5)<>0 then 103
102 s(5)=-1:goto 195
103 if s(5)<>1 then 106
104 if s(1)<>0 then 110
105 s(1)=-1:goto 195
106 if s(2)=1 and s(1)=0 then 181
107 if s(4)=1 and s(1)=0 then 181
108 if s(6)=1 and s(9)=0 then 189
109 if s(8)=1 and s(9)=0 then 189
110 if g=1 then 112
111 goto 118
112 j=3*int((m-1)/3)+1
113 if 3*int((m-1)/3)+1=m then k=1
114 if 3*int((m-1)/3)+2=m then k=2
115 if 3*int((m-1)/3)+3=m then k=3
116 goto 120
118 for j=1 to 7 step 3:for k=1 to 3
120 if s(j)<>g then 130
122 if s(j+2)<>g then 135
126 if s(j+1)<>0 then 150
128 s(j+1)=-1:goto 195
130 if s(j)=h then 150
131 if s(j+2)<>g then 150
132 if s(j+1)<>g then 150
133 s(j)=-1:goto 195
135 if s(j+2)<>0 then 150
136 if s(j+1)<>g then 150
138 s(j+2)=-1:goto 195
150 if s(k)<>g then 160
152 if s(k+6)<>g then 165
156 if s(k+3)<>0 then 170
158 s(k+3)=-1:goto 195
160 if s(k)=h then 170
161 if s(k+6)<>g then 170
162 if s(k+3)<>g then 170
163 s(k)=-1:goto 195
165 if s(k+6)<>0 then 170
166 if s(k+3)<>g then 170
168 s(k+6)=-1:goto 195
170 goto 450
171 if s(3)=g and s(7)=0 then 187
172 if s(9)=g and s(1)=0 then 181
173 if s(7)=g and s(3)=0 then 183
174 if s(9)=0 and s(1)=g then 189
175 if g=-1 then g=1:h=-1:goto 110
176 if s(9)=1 and s(3)=0 then 182
177 for i=2 to 9:if s(i)<>0 then 179
178 s(i)=-1:goto 195
179 next i
181 s(1)=-1:goto 195
182 if s(1)=1 then 177
183 s(3)=-1:goto 195
187 s(7)=-1:goto 195
189 s(9)=-1
195 print:print"the computer moves to..."
202 gosub 1000
205 goto 500
450 if g=1 then 465
455 if j=7 and k=3 then 465
460 next k,j
465 if s(5)=g then 171
467 goto 175
475 p$="x":q$="o" : rem ----goto dest ----
500 print:input"where do you move";m
502 if m=0 then print"thanks for the game.":goto 2000
503 if m>9 then 506
505 if s(m)=0 then 510
506 print"that square is occupied.":print:print:goto 500
510 g=1:s(m)=1
520 gosub 1000
530 goto 100
1000 print
1005 for i=1 to 9  : rem start for i -----
1010 print" ";:if s(i)<>-1 then 1014
1012 print q$;" ";:goto 1020
1014 if s(i)<>0 then 1018
1016 print"  ";:goto 1020
1018 print p$;" ";
1020 if i<>3 and i<>6 then 1050
1030 print:print"---+---+---"
1040 goto 1080
1050 if i=9 then 1080
1060 print"!";
1080 next i : rem end for i        -------
1085 print:print:print
1095 for i=1 to 7 step 3
1100 if s(i)<>s(i+1)then 1115
1105 if s(i)<>s(i+2)then 1115
1110 if s(i)=-1 then 1350
1112 if s(i)=1 then 1200
1115 next i:for i=1 to 3:if s(i)<>s(i+3)then 1150
1130 if s(i)<>s(i+6)then 1150
1135 if s(i)=-1 then 1350
1137 if s(i)=1 then 1200
1150 next i:for i=1 to 9:if s(i)=0 then 1155
1152 next i:goto 1400
1155 if s(5)<>g then 1170
1160 if s(1)=g and s(9)=g then 1180
1165 if s(3)=g and s(7)=g then 1180
1170 return
1180 if g=-1 then 1350
1200 print"you beat me!! good game.":goto 2000
1350 print"i win, turkey!!!":goto 2000
1400 print"it's a draw. thank you."
2000 end
                                                                                                  
