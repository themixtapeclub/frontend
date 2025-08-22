// components/cart/open-cart.tsx

export default function OpenCart({
  className,
  quantity
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <>
      {/* <ShoppingCartIcon
        className={clsx('h-4 transition-all ease-in-out hover:scale-110 ', className)}
      /> */}
      <div className="me-2 outline">Cart</div>{' '}
      {quantity ? <div className="quantity">({quantity})</div> : null}
    </>
  );
}
