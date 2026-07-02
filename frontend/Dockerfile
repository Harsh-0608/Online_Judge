# Serve using Nginx
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
