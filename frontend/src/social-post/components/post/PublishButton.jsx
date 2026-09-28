import Button from "../common/Button.jsx";

export default function PublishButton({
  onClick,
  disabled,
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
    >
      <span className="inline-flex items-center gap-2">
        <span>Publish post</span>

        <span
          aria-hidden="true"
          className="
            inline-flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-sm
            transition-transform
            duration-200
            group-hover:translate-x-0.5
          "
        >
          →
        </span>
      </span>
    </Button>
  );
}