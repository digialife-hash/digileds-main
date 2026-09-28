FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN if node -e "const p=require('./package.json'); process.exit(p.dependencies?.vite || p.devDependencies?.vite ? 0 : 1)"; then npm run build -- --base=./; else PUBLIC_URL=./ npm run build; fi

RUN for root in dist build; do if [ -d "$root" ]; then for file in $(find "$root" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.mjs" \)); do node -e 'const fs=require("fs");const p=process.argv[1];let s=fs.readFileSync(p,"utf8");const d="assets|uploads|images|videos|fonts|media";s=s.replace(new RegExp("(["+String.fromCharCode(34,39,40)+"])/("+d+")/","g"),"$1./$2/");const b=String.fromCharCode(96);s=s.replace(new RegExp(b+"/("+d+")/","g"),b+"./$1/");fs.writeFileSync(p,s)' "$file"; done; fi; done

RUN mkdir -p /app/output && if [ -f dist/index.html ]; then cp -r dist/. /app/output/; elif [ -f build/index.html ]; then cp -r build/. /app/output/; else found=0; for dir in dist/* build/*; do if [ -f "$dir/index.html" ]; then cp -r "$dir"/. /app/output/; found=1; break; fi; done; if [ "$found" = "0" ]; then echo "Build output with index.html not found"; exit 1; fi; fi

FROM nginx:alpine


RUN rm -f /etc/nginx/conf.d/default.conf

RUN printf '%s' '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#e2e8f0"/><text x="600" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" fill="#64748b">Image unavailable</text></svg>' > /usr/share/nginx/html/demo-placeholder.svg

RUN printf '%s\n' 'server {' '    listen 80;' '    server_name _;' '    root /usr/share/nginx/html;' '    index index.html;' '' '    location / {' '        try_files $uri $uri/ /index.html;' '    }' '' '    location ~* \.(jpg|jpeg|png|gif|webp|svg)$ {' '        try_files $uri /demo-placeholder.svg;' '    }' '}' > /etc/nginx/conf.d/default.conf


COPY --from=build /app/output /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
