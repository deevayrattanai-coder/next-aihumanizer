const Loading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
        <span className="text-primary-foreground font-display font-bold text-lg">
          D
        </span>
      </div>
      <div className="flex gap-1">
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  </div>
);

export default Loading;
