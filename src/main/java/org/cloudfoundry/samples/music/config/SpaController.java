package org.cloudfoundry.samples.music.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping("/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }

    @GetMapping("/{path:[^\\.]*}/**")
    public String forwardNested() {
        return "forward:/index.html";
    }
}
