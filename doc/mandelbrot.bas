100 rem mandelbrot set in b & w
101 rem program adapted from version 
102 rem at https://www.calormen.com/jsbasic/
103 rem adapted by cursorkeys 2022 for basic64js
105 turbo: border 0
110 mode 2: gpen 1:gcolors 0,1 : gcls
120 for x = 0 to 279:for y = 0 to 95
130 x1 = x / 280 * 3 - 2:y1 = y / 191 * 2 - 1
140 i = 0:s = x1:t = y1:c = 0
150 s1 = s * s - t * t + x1
160 t = 2 * s * t + y1:s = s1:c = 1 - c:i = i + 1
170 if s * s + t * t < 4 and i < 117 then goto 150
180 if c = 0 then plot x,y:plot x,191 - y
190 next:next
