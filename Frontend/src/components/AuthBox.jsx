import Logo from "../../src/assets/favicon.png";
import { useNavigate } from "react-router-dom";

function AuthBox({ titleBrand, subBrand, btnText, NavigateTo }) {
  const navigate = useNavigate();
  return (
    <div className="authbox">
      <div className="authbox-illustration">
        <div className="illust-circle illust-1"></div>
        <div className="illust-circle illust-2"></div>
        <div className="illust-circle illust-3"></div>
        <img className="illust-logo" src={Logo} alt="PocketFlow" />
      </div>
      <div className="authbox-brand-text">
        <h1>{titleBrand}</h1>
        <p>{subBrand}</p>
      </div>
      <button className="btn-authbox" onClick={() => navigate(NavigateTo)}>
        {btnText}
      </button>
    </div>
  );
}

export default AuthBox;
