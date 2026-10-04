---
title: 用 Go 写一个最小可用的 HTTP 服务
description: 从零开始用标准库实现一个生产可用的 HTTP 服务，覆盖路由、中间件、优雅关停
pubDate: 2026-09-30
tags: ["go", "architecture"]
lang: zh-CN
---

每学一门新语言，我都会写一遍"最小可用 HTTP 服务"——不是 Hello World 那种 5 行玩具，而是带路由、中间件、优雅关停、能直接上生产的版本。

这篇文章以 Go 为例，展示一个完整的最小骨架。所有代码加起来不到 100 行。

## 项目结构

```
minihttp/
├── go.mod
├── main.go
├── server.go
├── middleware.go
└── handlers.go
```

## go.mod

```go
module github.com/sylvan-io/minihttp

go 1.22
```

## main.go — 组装一切

```go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	mux := newMux()
	handler := withMiddleware(mux, recoverer, logger)

	srv := &http.Server{
		Addr:              ":8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	// 等待 SIGINT/SIGTERM，触发优雅关停
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
	log.Println("bye")
}
```

注意几个关键点：

- **`go func()` 异步启动 server**，主协程专职监听信号
- **`signal.Notify`** 捕获 SIGINT（Ctrl+C）和 SIGTERM（k8s 滚动更新）
- **`srv.Shutdown(ctx)`** 给正在处理的请求 10 秒收尾时间

## server.go — 路由

```go
package main

import "net/http"

func newMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthz)
	mux.HandleFunc("GET /hello/{name}", hello)
	return mux
}

func healthz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

func hello(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		name = "world"
	}
	_, _ = w.Write([]byte("hello, " + name))
}
```

> Go 1.22 起，标准库 `http.ServeMux` 原生支持方法匹配和路径参数（`{name}`），不再需要第三方路由库。

## middleware.go — 可组合中间件

```go
package main

import (
	"log"
	"net/http"
	"runtime/debug"
	"time"
)

type Middleware func(http.Handler) http.Handler

func withMiddleware(h http.Handler, mws ...Middleware) http.Handler {
	// 反向包裹：最先注册的中间件最外层
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

func recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("panic: %v\n%s", rec, debug.Stack())
				http.Error(w, "internal error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
```

中间件模式的核心是一个简单的类型别名：

```go
type Middleware func(http.Handler) http.Handler
```

它接一个 handler，包一层，返回新的 handler。`withMiddleware` 把它们按顺序串起来——洋葱模型。

## 测试一下

```bash
$ go run .
listening on :8080

# 另开一个终端
$ curl localhost:8080/healthz
{"status":"ok"}

$ curl localhost:8080/hello/sylvan
hello, sylvan

# Ctrl+C 触发优雅关停
^C
shutting down...
bye
```

## 还可以加什么？

这个骨架已经能上生产，但通常会再补几样：

- **`context` 透传**：用 `r.Context()` 拿取消信号，配合数据库 client
- **`http.Server` 的 `BaseContext`**：把 traceID 注入到 ctx
- **超时配置**：`ReadTimeout` / `WriteTimeout` / `IdleTimeout`
- **`pprof` 端点**：用 `net/http/pprof` 注册到 `/debug/pprof`
- **结构化日志**：换 `slog` 或 `zap`，JSON 格式方便日志系统采集

## 总结

Go 的 `net/http` 标准库是这个语言被低估的部分。它没有 Gin、Echo 那么花哨，但 100 行内能搭出一个生产可用的服务，是其他主流语言很难做到的。

下次有人问"Go 到底适合干什么"，你可以把这个例子发给他看——这就是答案。
