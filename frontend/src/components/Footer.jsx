
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-content">

                <div className="footer-brand">
                    <h2>GatherGrid<span>.</span></h2>
                </div>

                <div className="footer-socials">

                    <a href="#" aria-label="Instagram" title="Instagram">
                        ◎
                    </a>

                    <a href="#" aria-label="Twitter" title="Twitter">
                        𝕏
                    </a>

                    <a href="#" aria-label="YouTube" title="YouTube">
                        ▶
                    </a>

                </div>

                <p className="footer-copyright">
                    © {new Date().getFullYear()} GatherGrid. All rights reserved.
                </p>

            </div>

        </footer>
    );
}

export default Footer;
