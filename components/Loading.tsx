export const Loading: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`loader ${className}`}>
      <style jsx>{`
        .loader {
          border: 6px solid rgba(0, 0, 0, 0);
          border-top: 6px solid currentColor;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1.5s ease infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export const FullLoading: React.FC = (props) => (
  <div
    className="flex items-center justify-center w-full h-full flex-grow text-center"
    {...props}
  >
    <Loading />
  </div>
)
