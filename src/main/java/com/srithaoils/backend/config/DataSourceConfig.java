package com.srithaoils.backend.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();

        if (url != null) {
            JdbcConnectionDetails jdbcConnectionDetails = toJdbcConnectionDetails(url);
            properties.setUrl(jdbcConnectionDetails.url());

            if (isBlank(properties.getUsername()) && !isBlank(jdbcConnectionDetails.username())) {
                properties.setUsername(jdbcConnectionDetails.username());
            }

            if (isBlank(properties.getPassword()) && !isBlank(jdbcConnectionDetails.password())) {
                properties.setPassword(jdbcConnectionDetails.password());
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }

    private JdbcConnectionDetails toJdbcConnectionDetails(String rawUrl) {
        String normalizedUrl = rawUrl.startsWith("jdbc:") ? rawUrl.substring(5) : rawUrl;

        if (normalizedUrl.startsWith("postgres://")) {
            normalizedUrl = "postgresql://" + normalizedUrl.substring("postgres://".length());
        }

        if (!normalizedUrl.startsWith("postgresql://")) {
            return new JdbcConnectionDetails(rawUrl, null, null);
        }

        try {
            URI uri = new URI(normalizedUrl);
            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                    .append(uri.getHost());

            if (uri.getPort() > 0) {
                jdbcUrl.append(':').append(uri.getPort());
            }

            jdbcUrl.append(uri.getPath());

            if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                jdbcUrl.append('?').append(uri.getQuery());
            }

            String username = null;
            String password = null;
            String userInfo = uri.getUserInfo();

            if (!isBlank(userInfo)) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts.length > 1 ? parts[1] : null;
            }

            return new JdbcConnectionDetails(jdbcUrl.toString(), username, password);
        } catch (URISyntaxException exception) {
            return new JdbcConnectionDetails(rawUrl, null, null);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record JdbcConnectionDetails(String url, String username, String password) {
        private JdbcConnectionDetails {
            url = Objects.requireNonNull(url);
        }
    }
}
